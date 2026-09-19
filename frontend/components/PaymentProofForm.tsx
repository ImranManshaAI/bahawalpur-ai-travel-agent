"use client";

import { useState } from "react";
import { uploadPaymentProof } from "@/lib/api";

import type {
  PaymentMethod,
  PaymentProofResponse,
} from "@/lib/api-types";

interface PaymentProofFormProps {
  bookingId: string;
  totalPrice: number;
  paymentMethods: PaymentMethod[];
  onPaymentSubmitted?: (proof: PaymentProofResponse) => void;
}

export default function PaymentProofForm({
  bookingId,
  totalPrice,
  paymentMethods,
  onPaymentSubmitted,
}: PaymentProofFormProps) {
  const [paymentMethodId, setPaymentMethodId] = useState(
    paymentMethods[0]?.id ?? "",
  );

  const [transactionReference, setTransactionReference] =
    useState("");

  const [amountClaimed, setAmountClaimed] =
    useState(String(totalPrice));

  const [file, setFile] = useState<File | null>(null);

  const [submittedProof, setSubmittedProof] =
    useState<PaymentProofResponse | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const selectedPaymentMethod =
    paymentMethods.find(
      (method) => method.id === paymentMethodId,
    ) ?? null;

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setErrorMessage(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      event.target.value = "";

      setErrorMessage(
        "Please upload a JPEG, PNG, or WEBP image.",
      );

      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxFileSize) {
      setFile(null);
      event.target.value = "";

      setErrorMessage(
        "Payment proof image must be 5 MB or smaller.",
      );

      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!file) {
      setErrorMessage(
        "Please select your payment screenshot.",
      );
      return;
    }

    const numericAmount = Number(amountClaimed);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setErrorMessage(
        "Please enter a valid payment amount.",
      );
      return;
    }

    if (!transactionReference.trim()) {
      setErrorMessage(
        "Please enter your transaction reference.",
      );
      return;
    }

    if (
      paymentMethods.length > 0 &&
      !paymentMethodId
    ) {
      setErrorMessage(
        "Please select a payment method.",
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await uploadPaymentProof(
        bookingId,
        file,
        paymentMethodId || undefined,
        transactionReference.trim(),
        numericAmount,
      );

      setSubmittedProof(response);

      onPaymentSubmitted?.(response);
    } catch (error) {
      console.error(
        "Failed to upload payment proof:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't submit your payment proof. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * STEP 05 — CONFIRMATION
   */
  if (submittedProof) {
    return (
      <section
        aria-labelledby="payment-proof-success-heading"
        className="rounded-xl border border-green-200 bg-white p-6 shadow-sm"
      >
        {/* SUCCESS HEADER */}
        <div
          className="rounded-xl border border-green-200 bg-green-50 p-5"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-black text-white">
              ✓
            </div>

            <div>
              <p className="text-base font-bold text-green-950">
                Payment proof submitted successfully
              </p>

              <p className="mt-1 text-sm leading-6 text-green-800">
                Your payment proof has been received and is
                waiting for administrator verification.
              </p>
            </div>
          </div>
        </div>

        {/* CONFIRMATION CARD */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                Step 05
              </p>

              <h2
                id="payment-proof-success-heading"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Booking confirmation
              </h2>
            </div>

            <span className="inline-flex w-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold capitalize text-green-800">
              {submittedProof.status.replace(
                /_/g,
                " ",
              )}
            </span>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Booking ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-950">
              {submittedProof.booking_id}
            </p>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment proof ID
              </dt>

              <dd className="mt-1 break-all text-sm font-semibold text-slate-950">
                {submittedProof.payment_proof_id}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Transaction reference
              </dt>

              <dd className="mt-1 break-all text-sm font-semibold text-slate-950">
                {submittedProof.transaction_reference ||
                  "Not provided"}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount claimed
              </dt>

              <dd className="mt-1 text-sm font-bold text-slate-950">
                PKR{" "}
                {submittedProof.amount_claimed !== null
                  ? submittedProof.amount_claimed.toLocaleString(
                      "en-PK",
                    )
                  : "Not provided"}
              </dd>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Verification status
              </dt>

              <dd className="mt-1 text-sm font-bold capitalize text-slate-950">
                {submittedProof.status.replace(
                  /_/g,
                  " ",
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* WHAT HAPPENS NEXT */}
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <h3 className="text-base font-bold text-green-950">
            What happens next?
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                1
              </span>

              <p className="text-sm leading-6 text-green-900">
                Your payment proof is now with the travel
                administrator.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                2
              </span>

              <p className="text-sm leading-6 text-green-900">
                The administrator will verify your payment
                proof.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                3
              </span>

              <p className="text-sm leading-6 text-green-900">
                Keep your booking reference and payment
                details for future status checks.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="payment-proof-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* HEADER */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
          Step 04
        </p>

        <h2
          id="payment-proof-heading"
          className="mt-1 text-2xl font-bold tracking-tight text-slate-950"
        >
          Payment
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Complete your payment and submit the payment
          screenshot for administrator verification.
        </p>
      </div>

      {/* PAYMENT TOTAL */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Amount to pay
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Please transfer the exact booking amount.
          </p>
        </div>

        <p className="text-2xl font-black text-green-700">
          PKR {totalPrice.toLocaleString("en-PK")}
        </p>
      </div>

      {/* HOW TO COMPLETE YOUR PAYMENT */}
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
        <h3 className="text-lg font-bold text-green-950">
          How to Complete Your Payment
        </h3>

        <ol className="mt-4 space-y-3 text-sm leading-6 text-green-900">
          <li className="flex gap-3">
            <span className="font-black">1.</span>
            <span>
              Transfer your payment to the{" "}
              <strong>Sadapay</strong> account provided below.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">2.</span>
            <span>
              Transfer the{" "}
              <strong>exact booking amount</strong> shown on
              the screen.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">3.</span>
            <span>
              After completing the transfer, save a{" "}
              <strong>screenshot</strong> of the transaction.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">4.</span>
            <span>
              Enter your Sadapay{" "}
              <strong>transaction/reference number</strong>{" "}
              in the Transaction Reference field.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">5.</span>
            <span>
              Enter the exact amount you transferred in the{" "}
              <strong>Amount Paid</strong> field.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">6.</span>
            <span>
              Upload your{" "}
              <strong>payment screenshot</strong>.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">7.</span>
            <span>
              Click <strong>Submit Payment Proof</strong>.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-black">8.</span>
            <span>
              Your payment proof will be sent for{" "}
              <strong>verification and booking confirmation</strong>.
            </span>
          </li>
        </ol>
      </div>

      {/* SADAPAY ACCOUNT DETAILS */}
      <div className="mt-6 rounded-xl border border-[#cfe8dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
              Payment Account
            </p>

            <h3 className="mt-1 text-xl font-black text-slate-950">
              Sadapay
            </h3>
          </div>

          <span className="inline-flex w-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
            Official Payment Account
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bank / Payment Method
            </p>

            <p className="mt-1 text-base font-bold text-slate-950">
              Sadapay
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account Title
            </p>

            <p className="mt-1 text-base font-bold text-slate-950">
              Imran Mansha
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account No.
            </p>

            <p className="mt-1 break-all text-base font-bold text-slate-950">
              03208614760
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-950">
            Please verify the account title and account number
            before making your payment.
          </p>
        </div>
      </div>

      {/* OPTIONAL API PAYMENT METHODS */}
      {paymentMethods.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-slate-950">
            Available payment methods
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const isSelected =
                paymentMethodId === method.id;

              return (
                <label
                  key={method.id}
                  className={`cursor-pointer rounded-xl border bg-white p-5 transition ${
                    isSelected
                      ? "border-green-700 ring-2 ring-green-700"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.id}
                    checked={isSelected}
                    onChange={() =>
                      setPaymentMethodId(method.id)
                    }
                    className="sr-only"
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-slate-950">
                        {method.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Select this account for payment.
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`h-4 w-4 rounded-full border-2 ${
                        isSelected
                          ? "border-green-700 bg-green-700"
                          : "border-slate-300"
                      }`}
                    />
                  </div>

                  <div className="mt-5 space-y-3 rounded-lg bg-slate-50 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Account title
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {method.account_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Account number
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                        {method.account_number}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedPaymentMethod && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">
                Selected payment account
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {selectedPaymentMethod.name} —{" "}
                {selectedPaymentMethod.account_name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ERROR */}
      {errorMessage && (
        <div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Payment submission failed
          </p>

          <p className="mt-1 text-sm text-red-800">
            {errorMessage}
          </p>
        </div>
      )}

      {/* PAYMENT FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        {/* TRANSACTION REFERENCE */}
        <div>
          <label
            htmlFor="transaction-reference"
            className="block text-sm font-semibold text-slate-900"
          >
            Transaction Reference
          </label>

          <input
            id="transaction-reference"
            name="transaction_reference"
            type="text"
            required
            placeholder="Enter your transaction/reference number"
            value={transactionReference}
            onChange={(event) =>
              setTransactionReference(event.target.value)
            }
            disabled={isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        {/* AMOUNT */}
        <div>
          <label
            htmlFor="amount-claimed"
            className="block text-sm font-semibold text-slate-900"
          >
            Amount Paid
          </label>

          <input
            id="amount-claimed"
            name="amount_claimed"
            type="number"
            min="0"
            step="0.01"
            required
            value={amountClaimed}
            onChange={(event) =>
              setAmountClaimed(event.target.value)
            }
            disabled={isSubmitting}
            className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p className="mt-1 text-xs text-slate-500">
            Booking total: PKR{" "}
            {totalPrice.toLocaleString("en-PK")}
          </p>
        </div>

        {/* SCREENSHOT */}
        <div>
          <label
            htmlFor="payment-proof-file"
            className="block text-sm font-semibold text-slate-900"
          >
            Payment Screenshot
          </label>

          <input
            id="payment-proof-file"
            name="file"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p className="mt-1 text-xs text-slate-500">
            Accepted formats: JPEG, PNG, WEBP. Maximum size:
            5 MB.
          </p>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !file ||
            !transactionReference.trim() ||
            !amountClaimed ||
            (paymentMethods.length > 0 &&
              !paymentMethodId)
          }
          className="min-h-11 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          {isSubmitting
            ? "Submitting payment proof..."
            : "Submit Payment Proof"}
        </button>
      </form>
    </section>
  );
}