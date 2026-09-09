"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/lib/api-types";

interface PaymentProofFormProps {
  bookingId: string;
  totalPrice: number;
  paymentMethods: PaymentMethod[];
}

interface PaymentProofPayload {
  booking_id: string;
  payment_method_id: string;
  transaction_reference: string;
  amount_claimed: number;
  file_name: string;
}

export default function PaymentProofForm({
  bookingId,
  totalPrice,
  paymentMethods,
}: PaymentProofFormProps) {
  const [paymentMethodId, setPaymentMethodId] = useState(
    paymentMethods[0]?.id ?? "",
  );
  const [transactionReference, setTransactionReference] = useState("");
  const [amountClaimed, setAmountClaimed] = useState(String(totalPrice));
  const [file, setFile] = useState<File | null>(null);
  const [submittedProof, setSubmittedProof] =
    useState<PaymentProofPayload | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!paymentMethodId || !file) {
      return;
    }

    const payload: PaymentProofPayload = {
      booking_id: bookingId,
      payment_method_id: paymentMethodId,
      transaction_reference: transactionReference.trim(),
      amount_claimed: Number(amountClaimed),
      file_name: file.name,
    };

    setSubmittedProof(payload);
  }

  if (submittedProof) {
    return (
      <section
        aria-labelledby="payment-proof-success-heading"
        className="rounded-xl border border-slate-200 bg-white p-6"
      >
        <div
          className="rounded-lg border border-green-200 bg-green-50 p-5"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-green-900">
            Payment proof submitted
          </p>

          <p className="mt-1 text-sm text-green-800">
            Your payment proof is ready for admin verification.
          </p>
        </div>

        <div className="mt-6">
          <h2
            id="payment-proof-success-heading"
            className="text-xl font-bold text-slate-950"
          >
            Payment proof details
          </h2>

          <dl className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Booking ID
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedProof.booking_id}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Transaction reference
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedProof.transaction_reference || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount claimed
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {submittedProof.amount_claimed}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Proof file
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {submittedProof.file_name}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-950">
            Verification status
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Your payment proof is pending admin verification.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="payment-proof-heading"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div>
        <h2
          id="payment-proof-heading"
          className="text-2xl font-bold tracking-tight text-slate-950"
        >
          Payment proof
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Submit your manual payment details and proof for verification.
        </p>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Available payment methods
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`cursor-pointer rounded-lg border bg-white p-4 transition ${
                  paymentMethodId === method.id
                    ? "border-slate-950 ring-2 ring-slate-950"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={method.id}
                  checked={paymentMethodId === method.id}
                  onChange={() => setPaymentMethodId(method.id)}
                  className="sr-only"
                />

                <span className="block text-sm font-semibold text-slate-950">
                  {method.name}
                </span>

                <span className="mt-2 block text-xs text-slate-600">
                  Account name: {method.account_name}
                </span>

                <span className="mt-1 block text-xs text-slate-600">
                  Account number: {method.account_number}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-amber-900">
            No payment methods are currently available.
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Please try again later or contact the administrator.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="transaction-reference"
            className="block text-sm font-semibold text-slate-900"
          >
            Transaction reference
          </label>

          <input
            id="transaction-reference"
            name="transaction_reference"
            type="text"
            required
            value={transactionReference}
            onChange={(event) =>
              setTransactionReference(event.target.value)
            }
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          />
        </div>

        <div>
          <label
            htmlFor="amount-claimed"
            className="block text-sm font-semibold text-slate-900"
          >
            Amount claimed
          </label>

          <input
            id="amount-claimed"
            name="amount_claimed"
            type="number"
            min="0"
            step="0.01"
            required
            value={amountClaimed}
            onChange={(event) => setAmountClaimed(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          />

          <p className="mt-1 text-xs text-slate-500">
            Booking total: {totalPrice}
          </p>
        </div>

        <div>
          <label
            htmlFor="payment-proof-file"
            className="block text-sm font-semibold text-slate-900"
          >
            Payment screenshot
          </label>

          <input
            id="payment-proof-file"
            name="file"
            type="file"
            required
            accept="image/*,.pdf"
            onChange={(event) =>
              setFile(event.target.files?.[0] ?? null)
            }
            className="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold"
          />

          <p className="mt-1 text-xs text-slate-500">
            Accepted formats: image or PDF.
          </p>
        </div>

        <button
          type="submit"
          disabled={!paymentMethodId || !file}
          className="min-h-11 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          Submit payment proof
        </button>
      </form>
    </section>
  );
}