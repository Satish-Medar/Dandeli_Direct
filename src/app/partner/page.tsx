"use client";

import { useState } from "react";
import Link from "next/link";

export default function PartnerPage() {
  const [qrHash, setQrHash] = useState("");
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState(false);

  async function verifyVoucher() {
    setStatus("Checking voucher...");
    const response = await fetch("/api/partner/verify-voucher", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrHash, propertyId: "riverfront-02" }),
    });
    const result = await response.json();
    setVerified(response.ok);
    setStatus(
      response.ok
        ? `Verified. Payout ${result.payout.releaseWindow.toLowerCase()}.`
        : (result.error ?? "Voucher rejected."),
    );
  }

  return (
    <main className="partner-shell">
      <header className="partner-header">
        <Link className="brand" href="/">
          <span className="brand-mark">DD</span>
          <span>
            Dandeli <em>Direct</em>
          </span>
        </Link>
        <span className="partner-label">
          PARTNER PORTAL / GANESH GUDI RIVERFRONT #02
        </span>
        <Link className="back-link" href="/">
          ← Guest site
        </Link>
      </header>
      <section className="partner-intro">
        <p className="eyebrow">OPERATIONS DESK</p>
        <h1>
          Today&apos;s arrivals,
          <br />
          <i>at a glance.</i>
        </h1>
        <p>
          Check guests in, update room availability, and track payouts from one
          simple workspace.
        </p>
      </section>
      <section className="partner-stats">
        <div>
          <span>ARRIVALS TODAY</span>
          <strong>06</strong>
          <small>+2 from yesterday</small>
        </div>
        <div>
          <span>HELD PAYOUT</span>
          <strong>₹48,600</strong>
          <small>Releases within 2 hours</small>
        </div>
        <div>
          <span>ROOMS LIVE</span>
          <strong>18 / 22</strong>
          <small className="green">Availability is healthy</small>
        </div>
      </section>
      <section className="partner-grid">
        <div className="partner-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CHECK-IN DESK</p>
              <h2>Verify a voucher</h2>
            </div>
            <span className="scanner-icon">⌁</span>
          </div>
          <p className="panel-copy">
            Paste the QR hash from the guest voucher to validate the booking and
            schedule payout.
          </p>
          <label className="partner-input-label">
            QR HASH
            <input
              value={qrHash}
              onChange={(event) => setQrHash(event.target.value)}
              placeholder="Paste voucher hash"
            />
          </label>
          <button
            className="partner-action"
            type="button"
            onClick={verifyVoucher}
          >
            Verify guest <span>→</span>
          </button>
          {status && (
            <p className={`verification-status ${verified ? "success" : ""}`}>
              {status}
            </p>
          )}
        </div>
        <div className="partner-panel availability">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ROOM CALENDAR</p>
              <h2>June 18, 2026</h2>
            </div>
            <button className="calendar-action" type="button">
              Manage →
            </button>
          </div>
          <div className="room-row">
            <span>
              <b>Forest room · 01</b>
              <small>2 guests · arrival 12:00</small>
            </span>
            <button className="availability-toggle live" type="button">
              Available
            </button>
          </div>
          <div className="room-row">
            <span>
              <b>River room · 02</b>
              <small>4 guests · arrival 14:00</small>
            </span>
            <button className="availability-toggle blocked" type="button">
              Blocked
            </button>
          </div>
          <div className="room-row">
            <span>
              <b>Canopy room · 03</b>
              <small>2 guests · no arrival</small>
            </span>
            <button className="availability-toggle live" type="button">
              Available
            </button>
          </div>
        </div>
      </section>
      <section className="ledger-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PAYOUT LEDGER</p>
            <h2>Recent movement</h2>
          </div>
          <button className="calendar-action" type="button">
            View all →
          </button>
        </div>
        <div className="ledger-row">
          <span>
            <b>DD-8F42A1</b>
            <small>Guest checked in · today, 10:42</small>
          </span>
          <strong>
            ₹8,400 <em>HELD</em>
          </strong>
        </div>
        <div className="ledger-row">
          <span>
            <b>DD-19C2E0</b>
            <small>Released · June 16, 14:20</small>
          </span>
          <strong>
            ₹12,200 <em className="released">RELEASED</em>
          </strong>
        </div>
      </section>
    </main>
  );
}
