"use client";

import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useToast } from "@/components/ui/CustomToast";
import { useState } from "react";

const page = () => {
  const [name, setName] = useState("");
  const toast = useToast();
  return (
    <div className="py-30">
      <CustomInput
        label="Full Name"
        name="fullName"
        placeholder="Enter your full name"
        value={name}
        onChange={(value) => {
          setName(value);
        }}
        required
        clearable
      />
      <CustomInput
        label="First Name"
        name="firstName"
        valueMode="letters"
        placeholder="Your first name"
        required
      />
      <CustomInput
        label="Quantity"
        type="number"
        min={1}
        max={10}
        step={1}
        rules={{
          min: 1,
          max: 10,
        }}
      />
      <CustomInput
        label="Price"
        valueMode="decimal"
        prefixText="$"
        placeholder="0.00"
      />
      <CustomInput
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        clearable
        validateOn="blur"
      />
      <CustomInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        rules={{
          minLength: 8,
        }}
      />
      <CustomInput
        label="Create Password"
        type="password"
        required
        showCounter
        rules={{
          minLength: 8,
          maxLength: 32,

          validate: (value) => {
            if (!/[A-Z]/.test(value)) {
              return "Include at least one uppercase letter.";
            }

            if (!/[a-z]/.test(value)) {
              return "Include at least one lowercase letter.";
            }

            if (!/[0-9]/.test(value)) {
              return "Include at least one number.";
            }

            if (!/[!@#$%^&*]/.test(value)) {
              return "Include at least one special character.";
            }

            return null;
          },
        }}
      />
      <CustomInput
        label="Email"
        value="client@example.com"
        success="Email address verified."
      />

      <CustomSelect
        label="Preferred Time"
        tone="light"
        placeholder="Select a time"
        options={[
          {
            value: "morning",
            label: "Morning",
            description: "10:00 — 12:00",
          },

          {
            value: "afternoon",
            label: "Afternoon",
            description: "12:00 — 16:00",
          },

          {
            value: "evening",
            label: "Evening",
            description: "16:00 — 18:00",
          },
        ]}
      />

      <CustomSelect
        label="Selected Country"
        readOnly
        value="uk"
        options={[
          {
            value: "uk",
            label: "United Kingdom",
          },
        ]}
      />
      <CustomSelect label="Collection" loading options={[]} />
      <CustomSelect
        label="Fragrance Size"
        disabled
        value="100ml"
        options={[
          {
            value: "100ml",
            label: "100 ml",
          },
        ]}
      />
      <CustomSelect
        label="Country"
        success="Delivery is available to this location."
        value="uk"
        options={[
          {
            value: "uk",
            label: "United Kingdom",
          },
        ]}
      />
      <CustomSelect
        label="Delivery Method"
        placeholder="Choose delivery"
        options={[
          {
            value: "standard",

            label: "Standard Delivery",

            description: "3–5 business days",

            badge: "Free",
          },

          {
            value: "express",

            label: "Express Delivery",

            description: "1–2 business days",

            badge: "$25",
          },

          {
            value: "same-day",

            label: "Same Day",

            description: "Available in selected locations",

            badge: "London",
          },
        ]}
      />
      <CustomSelect
        label="Country"
        name="country"
        searchable
        clearable
        placeholder="Select country"
        searchPlaceholder="Search country..."
        options={[
          {
            value: "uk",
            label: "United Kingdom",
            description: "GBP · English",
            keywords: ["britain", "england", "london"],
          },
          {
            value: "uae",
            label: "United Arab Emirates",
            description: "AED · English / Arabic",
            keywords: ["dubai", "abu dhabi"],
          },
          {
            value: "iran",
            label: "Iran",
            description: "IRR · Persian",
          },
        ]}
      />
      <button
        onClick={() =>
          toast.success(
            "Added to your bag",

            {
              description:
                "Tuscan Wool Blazer has been added to your selection.",
            },
          )
        }
      >
        Success
      </button>
      <button
        onClick={() =>
          toast.error("Unable to complete request", {
            description: "Something went wrong. Please try again.",
          })
        }
      >
        Error
      </button>

      <button
        onClick={() =>
          toast.info("Your appointment is pending", {
            description: "Our client services team will contact you shortly.",
          })
        }
      >
        Info
      </button>

      <button
        onClick={() =>
          toast.warning("Only one item remaining", {
            description: "This size has limited availability.",
          })
        }
      >
        Warning
      </button>

      <button onClick={() => toast.loading("Updating your bag...")}>
        Loading
      </button>
    </div>
  );
};

export default page;
