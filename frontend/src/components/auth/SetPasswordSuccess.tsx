import React from "react";

export default function SetPasswordSuccess() {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-4 text-center">
      <p className="text-green-600 text-sm font-medium">✓ Lozinka je uspešno postavljena!</p>
      <p className="text-green-500 text-xs mt-1">Preusmeravamo vas na login stranicu...</p>
    </div>
  );
}
