--
-- PostgreSQL database dump
--

\restrict uTHzAV6aVYp6191wh5OWENGfLfyLnsA0WWkebTZkeUGGY6kbpGCYqrakIAwFqVb

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10 (Ubuntu 17.10-0ubuntu0.25.10.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: confirm_whole_bus_booking(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.confirm_whole_bus_booking(p_booking_id uuid, p_payment_proof_id uuid, p_reviewed_by uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_schedule_instance_id uuid;
  v_booking_type text;
  v_booking_status text;
  v_hold_id uuid;
  v_pp_booking_id uuid;
  v_pp_status text;
  v_total_seats int;
  v_hold_seats int;
  v_non_held_count int;
  v_seat_ids uuid[];
begin
  -- Lock the booking row for the duration of this transaction.
  select schedule_instance_id, booking_type, booking_status, hold_id
    into v_schedule_instance_id, v_booking_type, v_booking_status, v_hold_id
  from bookings
  where id = p_booking_id
  for update;

  if v_schedule_instance_id is null then
    raise exception 'Booking % not found', p_booking_id;
  end if;

  if v_booking_type <> 'whole_bus' then
    raise exception 'Booking % is not a whole-bus (Route 4) booking', p_booking_id;
  end if;

  if v_booking_status not in ('pending_payment', 'payment_submitted') then
    raise exception 'Booking % is in status % and cannot be confirmed', p_booking_id, v_booking_status;
  end if;

  if v_hold_id is null then
    raise exception 'Booking % has no associated seat hold; refusing to guess which seats to reserve', p_booking_id;
  end if;

  -- CRITICAL: validate the payment proof itself before changing anything.
  select booking_id, status
    into v_pp_booking_id, v_pp_status
  from payment_proofs
  where id = p_payment_proof_id
  for update;

  if v_pp_booking_id is null then
    raise exception 'Payment proof % not found', p_payment_proof_id;
  end if;

  if v_pp_booking_id <> p_booking_id then
    raise exception 'Payment proof % does not belong to booking %', p_payment_proof_id, p_booking_id;
  end if;

  if v_pp_status <> 'pending_verification' then
    raise exception 'Payment proof % is in status % and cannot be confirmed (already reviewed)', p_payment_proof_id, v_pp_status;
  end if;

  -- Lock exactly the seats tied to THIS booking's hold — never the whole
  -- schedule instance blindly.
  perform 1 from seats where hold_id = v_hold_id for update;

  select array_agg(id) into v_seat_ids from seats where hold_id = v_hold_id;
  select count(*) into v_hold_seats from seats where hold_id = v_hold_id;
  select count(*) into v_total_seats from seats where schedule_instance_id = v_schedule_instance_id;

  if v_hold_seats = 0 then
    raise exception 'No seats are currently linked to booking %''s hold; cannot confirm', p_booking_id;
  end if;

  if v_hold_seats <> v_total_seats then
    raise exception 'Booking %''s hold covers % of % seat(s) on schedule %; a whole-bus booking must hold every seat',
      p_booking_id, v_hold_seats, v_total_seats, v_schedule_instance_id;
  end if;

  select count(*) into v_non_held_count
  from seats
  where hold_id = v_hold_id
    and status <> 'held';

  if v_non_held_count > 0 then
    raise exception 'Cannot confirm booking %: % of its held seat(s) are no longer in ''held'' status', p_booking_id, v_non_held_count;
  end if;

  -- 1) Confirm the payment proof (now proven to exist, belong to this
  --    booking, and be pending review).
  update payment_proofs
  set status = 'confirmed',
      reviewed_by = p_reviewed_by,
      reviewed_at = now()
  where id = p_payment_proof_id;

  -- 2) Reserve every seat tied to this booking's hold.
  update seats
  set status = 'reserved',
      hold_expires_at = null,
      hold_id = null
  where hold_id = v_hold_id;

  -- 3) Ensure the booking <-> seat audit trail is complete (idempotent —
  --    create_booking_from_hold already inserted these rows when the
  --    booking was created).
  insert into booking_seats (booking_id, seat_id)
  select p_booking_id, sid from unnest(v_seat_ids) as sid
  on conflict (booking_id, seat_id) do nothing;

  -- 4) Confirm the booking itself.
  update bookings
  set booking_status = 'confirmed'
  where id = p_booking_id;
end;
$$;


--
-- Name: create_booking_from_hold(uuid, text, text, text, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_booking_from_hold(p_hold_token uuid, p_visitor_name text, p_visitor_phone text, p_visitor_email text, p_total_price numeric) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  v_hold_id uuid;
  v_status text;
  v_expires_at timestamptz;
  v_schedule_instance_id uuid;
  v_seat_count int;
  v_booking_id uuid;
  v_booking_ref text;
  v_pricing_model text;
  v_price_per_seat decimal(10,2);
  v_flat_price decimal(10,2);
  v_expected_total decimal(10,2);
begin
  select id, status, expires_at, schedule_instance_id
    into v_hold_id, v_status, v_expires_at, v_schedule_instance_id
  from booking_holds
  where hold_token = p_hold_token
  for update;

  if v_hold_id is null then
    raise exception 'Hold token not found';
  end if;

  if v_status <> 'active' then
    raise exception 'Hold is % and can no longer be converted into a booking', v_status;
  end if;

  if v_expires_at < now() then
    raise exception 'Hold has expired and can no longer be converted into a booking';
  end if;

  perform 1 from seats where hold_id = v_hold_id for update;

  select count(*) into v_seat_count from seats where hold_id = v_hold_id and status = 'held';

  if v_seat_count = 0 then
    raise exception 'Hold % has no held seats; it may have already been released or expired', p_hold_token;
  end if;

  if p_total_price is null or p_total_price < 0 then
    raise exception 'total_price must be a non-negative amount';
  end if;

  -- PRICING INTEGRITY CHECK: never trust a client-supplied total_price at
  -- face value. Independently recompute the expected total from this
  -- schedule's route pricing (confirmed by TDCP) and reject the booking if
  -- it doesn't match:
  --   - per_seat routes (Routes 1-3, Rs. 300/seat): expected = price_per_seat * seat_count.
  --   - flat_rate routes (Route 4, Rs. 30,000 whole-bus): expected = flat_price,
  --     regardless of seat_count — this is what guarantees Route 4 can never
  --     be booked for a per-seat-divided or per-seat-multiplied amount.
  select r.pricing_model, r.price_per_seat, r.flat_price
    into v_pricing_model, v_price_per_seat, v_flat_price
  from schedule_instances si
  join routes r on r.id = si.route_id
  where si.id = v_schedule_instance_id;

  if v_pricing_model is null then
    raise exception 'Could not resolve route pricing for schedule %', v_schedule_instance_id;
  end if;

  if v_pricing_model = 'per_seat' then
    if v_price_per_seat is null then
      raise exception 'Route pricing is not configured (price_per_seat is NULL) for schedule %; refusing to create booking', v_schedule_instance_id;
    end if;
    v_expected_total := v_price_per_seat * v_seat_count;
  elsif v_pricing_model = 'flat_rate' then
    if v_flat_price is null then
      raise exception 'Route pricing is not configured (flat_price is NULL) for schedule %; refusing to create booking', v_schedule_instance_id;
    end if;
    v_expected_total := v_flat_price;
  else
    raise exception 'Unrecognized pricing_model % for schedule %', v_pricing_model, v_schedule_instance_id;
  end if;

  if abs(p_total_price - v_expected_total) > 0.01 then
    raise exception 'total_price % does not match the expected price % for this booking (pricing_model=%, seats=%); refusing to create a booking with a mismatched amount',
      p_total_price, v_expected_total, v_pricing_model, v_seat_count;
  end if;

  v_booking_ref := 'TDCP-' || to_char(now(), 'YYYYMMDD') || '-' || substr(replace(uuid_generate_v4()::text, '-', ''), 1, 8);

  insert into bookings (
    booking_ref, schedule_instance_id, visitor_name, visitor_phone, visitor_email,
    passenger_count, total_price, hold_id
  )
  values (
    v_booking_ref, v_schedule_instance_id, p_visitor_name, p_visitor_phone, p_visitor_email,
    v_seat_count, p_total_price, v_hold_id
  )
  returning id into v_booking_id;

  insert into booking_seats (booking_id, seat_id)
  select v_booking_id, s.id from seats s where s.hold_id = v_hold_id
  on conflict (booking_id, seat_id) do nothing;

  update booking_holds set status = 'converted' where id = v_hold_id;

  return v_booking_id;
end;
$$;


--
-- Name: create_seat_hold(uuid, integer[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_seat_hold(p_schedule_instance_id uuid, p_seat_numbers integer[], p_hold_minutes integer DEFAULT NULL::integer) RETURNS TABLE(hold_token uuid, expires_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
declare
  v_hold_minutes int;
  v_expires_at timestamptz;
  v_hold_id uuid;
  v_hold_token uuid;
  v_requested_count int;
  v_matched_count int;
  v_unavailable_seats int[];
begin
  if p_seat_numbers is null or array_length(p_seat_numbers, 1) is null then
    raise exception 'At least one seat number must be supplied';
  end if;

  select count(*) into v_requested_count from (select distinct unnest(p_seat_numbers)) t;

  v_hold_minutes := p_hold_minutes;
  if v_hold_minutes is null then
    select default_hold_duration_minutes into v_hold_minutes from system_settings where id = 1;
  end if;

  if v_hold_minutes is null then
    raise exception 'Hold duration is not configured (system_settings.default_hold_duration_minutes is NULL) and no override was supplied';
  end if;

  if v_hold_minutes < 0 then
    raise exception 'Hold duration cannot be negative';
  end if;

  -- Lock the target seat rows (in a stable order) before inspecting them, so
  -- a concurrent hold attempt overlapping on any of the same seats waits
  -- instead of racing.
  perform 1
  from seats
  where schedule_instance_id = p_schedule_instance_id
    and seat_number = any(p_seat_numbers)
  order by seat_number
  for update;

  select count(*) into v_matched_count
  from seats
  where schedule_instance_id = p_schedule_instance_id
    and seat_number = any(p_seat_numbers);

  if v_matched_count <> v_requested_count then
    raise exception 'One or more requested seat numbers do not exist on schedule %', p_schedule_instance_id;
  end if;

  -- Lazily expire any stale holds among the seats we're about to inspect, so
  -- a hold nobody ever returned to doesn't block a new visitor forever.
  update seats
  set status = 'available', hold_id = null, hold_expires_at = null
  where schedule_instance_id = p_schedule_instance_id
    and seat_number = any(p_seat_numbers)
    and status = 'held'
    and hold_expires_at < now();

  select array_agg(seat_number)
    into v_unavailable_seats
  from seats
  where schedule_instance_id = p_schedule_instance_id
    and seat_number = any(p_seat_numbers)
    and status <> 'available';

  if v_unavailable_seats is not null then
    raise exception 'Seat(s) % on schedule % are not available to hold', v_unavailable_seats, p_schedule_instance_id;
  end if;

  v_expires_at := now() + (v_hold_minutes || ' minutes')::interval;

  insert into booking_holds (schedule_instance_id, expires_at)
  values (p_schedule_instance_id, v_expires_at)
  returning id, booking_holds.hold_token into v_hold_id, v_hold_token;

  update seats
  set status = 'held', hold_id = v_hold_id, hold_expires_at = v_expires_at
  where schedule_instance_id = p_schedule_instance_id
    and seat_number = any(p_seat_numbers);

  return query select v_hold_token, v_expires_at;
end;
$$;


--
-- Name: expire_stale_holds(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.expire_stale_holds() RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update seats
  set status = 'available', hold_id = null, hold_expires_at = null
  where status = 'held'
    and hold_expires_at < now();

  update booking_holds
  set status = 'expired'
  where status = 'active'
    and expires_at < now();
end;
$$;


--
-- Name: generate_seats_for_schedule(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_seats_for_schedule(p_schedule_instance_id uuid, p_bus_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_expected_count int;
  v_template_count int;
  v_inserted_count int;
begin
  select upper_deck_seats + lower_deck_seats into v_expected_count
  from buses
  where id = p_bus_id;

  if v_expected_count is null then
    raise exception 'Bus % not found', p_bus_id;
  end if;

  select count(*) into v_template_count
  from bus_seat_templates
  where bus_id = p_bus_id;

  if v_template_count <> v_expected_count then
    raise exception 'Bus % declares % seat(s) (upper + lower) but has % bus_seat_templates row(s); refusing to generate an incomplete/mismatched seat map',
      p_bus_id, v_expected_count, v_template_count;
  end if;

  insert into seats (schedule_instance_id, bus_seat_template_id, seat_number, deck, status)
  select p_schedule_instance_id, bst.id, bst.seat_number, bst.deck, 'available'
  from bus_seat_templates bst
  where bst.bus_id = p_bus_id;

  select count(*) into v_inserted_count
  from seats
  where schedule_instance_id = p_schedule_instance_id;

  if v_inserted_count <> v_expected_count then
    raise exception 'Seat generation for schedule % inserted % seat(s) but bus % expects %; rolling back',
      p_schedule_instance_id, v_inserted_count, p_bus_id, v_expected_count;
  end if;
end;
$$;


--
-- Name: reject_whole_bus_booking(uuid, uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reject_whole_bus_booking(p_booking_id uuid, p_payment_proof_id uuid, p_reviewed_by uuid, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_schedule_instance_id uuid;
  v_booking_type text;
  v_booking_status text;
  v_hold_id uuid;
  v_pp_booking_id uuid;
  v_pp_status text;
begin
  select schedule_instance_id, booking_type, booking_status, hold_id
    into v_schedule_instance_id, v_booking_type, v_booking_status, v_hold_id
  from bookings
  where id = p_booking_id
  for update;

  if v_schedule_instance_id is null then
    raise exception 'Booking % not found', p_booking_id;
  end if;

  if v_booking_type <> 'whole_bus' then
    raise exception 'Booking % is not a whole-bus (Route 4) booking', p_booking_id;
  end if;

  -- A confirmed booking is final; it must NEVER be reversible through this
  -- normal rejection path. Only 'pending_payment' / 'payment_submitted'
  -- (i.e. genuinely pre-confirmation) bookings may be rejected here.
  if v_booking_status not in ('pending_payment', 'payment_submitted') then
    raise exception 'Booking % is in status % and cannot be rejected through this function', p_booking_id, v_booking_status;
  end if;

  -- CRITICAL: validate the payment proof itself before changing anything.
  select booking_id, status
    into v_pp_booking_id, v_pp_status
  from payment_proofs
  where id = p_payment_proof_id
  for update;

  if v_pp_booking_id is null then
    raise exception 'Payment proof % not found', p_payment_proof_id;
  end if;

  if v_pp_booking_id <> p_booking_id then
    raise exception 'Payment proof % does not belong to booking %', p_payment_proof_id, p_booking_id;
  end if;

  if v_pp_status <> 'pending_verification' then
    raise exception 'Payment proof % is in status % and cannot be rejected (already reviewed)', p_payment_proof_id, v_pp_status;
  end if;

  update payment_proofs
  set status = 'rejected',
      reviewed_by = p_reviewed_by,
      reviewed_at = now(),
      review_notes = p_reason
  where id = p_payment_proof_id;

  update bookings
  set booking_status = 'rejected'
  where id = p_booking_id;

  -- Release ONLY the seats demonstrably tied to THIS booking's own hold —
  -- never a blanket "every seat on the schedule instance" release. This
  -- means a confirmed booking's ('reserved') seats, or any other booking's
  -- seats, can never be touched here, even if this booking somehow shared
  -- a schedule instance with another booking.
  if v_hold_id is not null then
    update seats
    set status = 'available',
        hold_expires_at = null,
        hold_id = null
    where hold_id = v_hold_id
      and status = 'held';

    update booking_holds
    set status = 'released'
    where id = v_hold_id
      and status = 'converted';
  end if;
end;
$$;


--
-- Name: release_seat_hold(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.release_seat_hold(p_hold_token uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_hold_id uuid;
  v_status text;
begin
  select id, status into v_hold_id, v_status
  from booking_holds
  where hold_token = p_hold_token
  for update;

  if v_hold_id is null then
    raise exception 'Hold token not found';
  end if;

  if v_status = 'converted' then
    raise exception 'This hold has already become a booking and cannot be released directly';
  end if;

  if v_status in ('released', 'expired') then
    return; -- already inactive; nothing to do
  end if;

  update seats
  set status = 'available', hold_id = null, hold_expires_at = null
  where hold_id = v_hold_id
    and status = 'held';

  update booking_holds
  set status = 'released'
  where id = v_hold_id;
end;
$$;


--
-- Name: trigger_set_booking_type(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_booking_type() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_route_type text;
begin
  select r.route_type into v_route_type
  from schedule_instances si
  join routes r on r.id = si.route_id
  where si.id = new.schedule_instance_id;

  if v_route_type = 'special_charter' then
    new.booking_type := 'whole_bus';
  else
    new.booking_type := 'per_seat';
  end if;

  return new;
end;
$$;


--
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: trigger_validate_booking_capacity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_validate_booking_capacity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  v_capacity int;
begin
  select b.upper_deck_seats + b.lower_deck_seats into v_capacity
  from schedule_instances si
  join buses b on b.id = si.bus_id
  where si.id = new.schedule_instance_id;

  if v_capacity is null then
    raise exception 'Cannot validate passenger_count: schedule_instance % or its bus was not found', new.schedule_instance_id;
  end if;

  if new.passenger_count > v_capacity then
    raise exception 'passenger_count % exceeds bus capacity % for schedule %', new.passenger_count, v_capacity, new.schedule_instance_id;
  end if;

  return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_holds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_holds (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    schedule_instance_id uuid NOT NULL,
    hold_token uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT booking_holds_status_check CHECK ((status = ANY (ARRAY['active'::text, 'converted'::text, 'released'::text, 'expired'::text])))
);


--
-- Name: booking_seats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_seats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    seat_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_ref text NOT NULL,
    schedule_instance_id uuid NOT NULL,
    visitor_name text NOT NULL,
    visitor_phone text NOT NULL,
    visitor_email text,
    passenger_count integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    booking_type text DEFAULT 'per_seat'::text NOT NULL,
    booking_status text DEFAULT 'pending_payment'::text NOT NULL,
    hold_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookings_booking_status_check CHECK ((booking_status = ANY (ARRAY['pending_payment'::text, 'payment_submitted'::text, 'confirmed'::text, 'rejected'::text, 'expired'::text]))),
    CONSTRAINT bookings_booking_type_check CHECK ((booking_type = ANY (ARRAY['per_seat'::text, 'whole_bus'::text]))),
    CONSTRAINT bookings_check CHECK (((booking_type <> 'whole_bus'::text) OR (hold_id IS NOT NULL))),
    CONSTRAINT bookings_passenger_count_check CHECK ((passenger_count >= 1)),
    CONSTRAINT bookings_passenger_count_check1 CHECK ((passenger_count <= 67)),
    CONSTRAINT bookings_total_price_check CHECK ((total_price >= (0)::numeric))
);


--
-- Name: bus_seat_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bus_seat_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bus_id uuid NOT NULL,
    seat_number integer NOT NULL,
    deck text NOT NULL,
    grid_row integer NOT NULL,
    grid_col integer NOT NULL,
    seat_type text DEFAULT 'standard'::text NOT NULL,
    CONSTRAINT bus_seat_templates_deck_check CHECK ((deck = ANY (ARRAY['upper'::text, 'lower'::text])))
);


--
-- Name: buses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    upper_deck_seats integer NOT NULL,
    lower_deck_seats integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT buses_lower_deck_seats_check CHECK ((lower_deck_seats >= 0)),
    CONSTRAINT buses_status_check CHECK ((status = ANY (ARRAY['active'::text, 'maintenance'::text]))),
    CONSTRAINT buses_upper_deck_seats_check CHECK ((upper_deck_seats >= 0))
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    method_type text NOT NULL,
    account_title text,
    account_number text,
    bank_name text,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_methods_method_type_check CHECK ((method_type = ANY (ARRAY['jazzcash'::text, 'easypaisa'::text, 'bank_transfer'::text, 'other'::text])))
);


--
-- Name: payment_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_proofs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    screenshot_url text NOT NULL,
    payment_method_id uuid,
    transaction_reference text,
    amount_claimed numeric(10,2),
    status text DEFAULT 'pending_verification'::text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_notes text,
    CONSTRAINT payment_proofs_amount_claimed_check CHECK (((amount_claimed IS NULL) OR (amount_claimed >= (0)::numeric))),
    CONSTRAINT payment_proofs_status_check CHECK ((status = ANY (ARRAY['pending_verification'::text, 'confirmed'::text, 'rejected'::text])))
);


--
-- Name: route_stops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.route_stops (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    route_id uuid NOT NULL,
    name text NOT NULL,
    sequence_order integer NOT NULL,
    stop_type text DEFAULT 'attraction'::text NOT NULL,
    stay_duration_minutes integer,
    entry_fee_reference numeric(10,2),
    notes text,
    CONSTRAINT route_stops_entry_fee_reference_check CHECK (((entry_fee_reference IS NULL) OR (entry_fee_reference >= (0)::numeric))),
    CONSTRAINT route_stops_stay_duration_minutes_check CHECK (((stay_duration_minutes IS NULL) OR (stay_duration_minutes >= 0))),
    CONSTRAINT route_stops_stop_type_check CHECK ((stop_type = ANY (ARRAY['pickup'::text, 'attraction'::text, 'transit'::text, 'drop_off'::text])))
);


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    hero_image_url text,
    route_type text DEFAULT 'standard'::text NOT NULL,
    pricing_model text NOT NULL,
    price_per_seat numeric(10,2),
    flat_price numeric(10,2),
    operating_days text[],
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT routes_check CHECK ((((pricing_model = 'per_seat'::text) AND (flat_price IS NULL)) OR ((pricing_model = 'flat_rate'::text) AND (price_per_seat IS NULL)))),
    CONSTRAINT routes_check1 CHECK (((pricing_model <> 'flat_rate'::text) OR (flat_price IS NOT NULL))),
    CONSTRAINT routes_check2 CHECK (((pricing_model <> 'per_seat'::text) OR (price_per_seat IS NOT NULL))),
    CONSTRAINT routes_flat_price_check CHECK (((flat_price IS NULL) OR (flat_price >= (0)::numeric))),
    CONSTRAINT routes_price_per_seat_check CHECK (((price_per_seat IS NULL) OR (price_per_seat >= (0)::numeric))),
    CONSTRAINT routes_pricing_model_check CHECK ((pricing_model = ANY (ARRAY['per_seat'::text, 'flat_rate'::text]))),
    CONSTRAINT routes_route_type_check CHECK ((route_type = ANY (ARRAY['standard'::text, 'special_charter'::text]))),
    CONSTRAINT routes_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])))
);


--
-- Name: schedule_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_instances (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bus_id uuid NOT NULL,
    route_id uuid NOT NULL,
    travel_date date NOT NULL,
    timing_slot text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT schedule_instances_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);


--
-- Name: seats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    schedule_instance_id uuid NOT NULL,
    bus_seat_template_id uuid NOT NULL,
    seat_number integer NOT NULL,
    deck text NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    hold_id uuid,
    hold_expires_at timestamp with time zone,
    CONSTRAINT seats_deck_check CHECK ((deck = ANY (ARRAY['upper'::text, 'lower'::text]))),
    CONSTRAINT seats_status_check CHECK ((status = ANY (ARRAY['available'::text, 'held'::text, 'booked'::text, 'reserved'::text])))
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer DEFAULT 1 NOT NULL,
    default_hold_duration_minutes integer,
    booking_advance_window_days integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT system_settings_booking_advance_window_days_check CHECK (((booking_advance_window_days IS NULL) OR (booking_advance_window_days >= 0))),
    CONSTRAINT system_settings_default_hold_duration_minutes_check CHECK (((default_hold_duration_minutes IS NULL) OR (default_hold_duration_minutes >= 0))),
    CONSTRAINT system_settings_id_check CHECK ((id = 1))
);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: booking_holds booking_holds_hold_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_holds
    ADD CONSTRAINT booking_holds_hold_token_key UNIQUE (hold_token);


--
-- Name: booking_holds booking_holds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_holds
    ADD CONSTRAINT booking_holds_pkey PRIMARY KEY (id);


--
-- Name: booking_seats booking_seats_booking_id_seat_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_seats
    ADD CONSTRAINT booking_seats_booking_id_seat_id_key UNIQUE (booking_id, seat_id);


--
-- Name: booking_seats booking_seats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_seats
    ADD CONSTRAINT booking_seats_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_ref_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_ref_key UNIQUE (booking_ref);


--
-- Name: bookings bookings_hold_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_hold_id_key UNIQUE (hold_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bus_seat_templates bus_seat_templates_bus_id_seat_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_seat_templates
    ADD CONSTRAINT bus_seat_templates_bus_id_seat_number_key UNIQUE (bus_id, seat_number);


--
-- Name: bus_seat_templates bus_seat_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_seat_templates
    ADD CONSTRAINT bus_seat_templates_pkey PRIMARY KEY (id);


--
-- Name: buses buses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_proofs payment_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_route_id_sequence_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_sequence_order_key UNIQUE (route_id, sequence_order);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: schedule_instances schedule_instances_bus_id_travel_date_timing_slot_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_instances
    ADD CONSTRAINT schedule_instances_bus_id_travel_date_timing_slot_key UNIQUE (bus_id, travel_date, timing_slot);


--
-- Name: schedule_instances schedule_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_instances
    ADD CONSTRAINT schedule_instances_pkey PRIMARY KEY (id);


--
-- Name: seats seats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_pkey PRIMARY KEY (id);


--
-- Name: seats seats_schedule_instance_id_seat_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_schedule_instance_id_seat_number_key UNIQUE (schedule_instance_id, seat_number);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: idx_booking_holds_schedule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_holds_schedule ON public.booking_holds USING btree (schedule_instance_id);


--
-- Name: idx_booking_holds_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_holds_token ON public.booking_holds USING btree (hold_token);


--
-- Name: idx_booking_seats_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_seats_booking ON public.booking_seats USING btree (booking_id);


--
-- Name: idx_booking_seats_seat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_seats_seat ON public.booking_seats USING btree (seat_id);


--
-- Name: idx_bookings_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_email ON public.bookings USING btree (visitor_email);


--
-- Name: idx_bookings_hold; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_hold ON public.bookings USING btree (hold_id);


--
-- Name: idx_bookings_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_phone ON public.bookings USING btree (visitor_phone);


--
-- Name: idx_bookings_schedule_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_schedule_type ON public.bookings USING btree (schedule_instance_id, booking_type);


--
-- Name: idx_payment_proofs_booking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_proofs_booking ON public.payment_proofs USING btree (booking_id);


--
-- Name: idx_payment_proofs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_proofs_status ON public.payment_proofs USING btree (status);


--
-- Name: idx_schedule_route_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_route_date ON public.schedule_instances USING btree (route_id, travel_date);


--
-- Name: idx_seats_hold_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seats_hold_id ON public.seats USING btree (hold_id);


--
-- Name: idx_seats_instance_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seats_instance_status ON public.seats USING btree (schedule_instance_id, status);


--
-- Name: bookings set_bookings_booking_type; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_bookings_booking_type BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_booking_type();


--
-- Name: bookings set_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();


--
-- Name: bookings validate_bookings_capacity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER validate_bookings_capacity BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trigger_validate_booking_capacity();


--
-- Name: booking_holds booking_holds_schedule_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_holds
    ADD CONSTRAINT booking_holds_schedule_instance_id_fkey FOREIGN KEY (schedule_instance_id) REFERENCES public.schedule_instances(id) ON DELETE CASCADE;


--
-- Name: booking_seats booking_seats_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_seats
    ADD CONSTRAINT booking_seats_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: booking_seats booking_seats_seat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_seats
    ADD CONSTRAINT booking_seats_seat_id_fkey FOREIGN KEY (seat_id) REFERENCES public.seats(id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_hold_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_hold_id_fkey FOREIGN KEY (hold_id) REFERENCES public.booking_holds(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_schedule_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_schedule_instance_id_fkey FOREIGN KEY (schedule_instance_id) REFERENCES public.schedule_instances(id) ON DELETE RESTRICT;


--
-- Name: bus_seat_templates bus_seat_templates_bus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus_seat_templates
    ADD CONSTRAINT bus_seat_templates_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE CASCADE;


--
-- Name: payment_proofs payment_proofs_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: payment_proofs payment_proofs_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- Name: payment_proofs payment_proofs_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.admin_users(id) ON DELETE SET NULL;


--
-- Name: route_stops route_stops_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- Name: schedule_instances schedule_instances_bus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_instances
    ADD CONSTRAINT schedule_instances_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE RESTRICT;


--
-- Name: schedule_instances schedule_instances_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_instances
    ADD CONSTRAINT schedule_instances_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE RESTRICT;


--
-- Name: seats seats_bus_seat_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_bus_seat_template_id_fkey FOREIGN KEY (bus_seat_template_id) REFERENCES public.bus_seat_templates(id) ON DELETE RESTRICT;


--
-- Name: seats seats_hold_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_hold_id_fkey FOREIGN KEY (hold_id) REFERENCES public.booking_holds(id) ON DELETE SET NULL;


--
-- Name: seats seats_schedule_instance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_schedule_instance_id_fkey FOREIGN KEY (schedule_instance_id) REFERENCES public.schedule_instances(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict uTHzAV6aVYp6191wh5OWENGfLfyLnsA0WWkebTZkeUGGY6kbpGCYqrakIAwFqVb

