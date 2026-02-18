import React, { useState } from "react";

const philippines = {
    name: "Philippines",
    code: "+63",
    min: 10,
    max: 10,
    format: "## #### ####",
};

function AddContactModal({ onAdd }) {
    const [name, setName] = useState("");
    const [relation, setRelation] = useState("");
    const [customRelation, setCustomRelation] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({ phone: "", email: "" });
    const [rawPhone, setRawPhone] = useState("");

    const allowedDomains = ["gmail.com", "yahoo.com"];

    // Handle Philippine number input
    const handlePhoneChange = (e) => {
        const input = e.target.value;
        // Remove all non-digit characters
        let digits = input.replace(/\D/g, "");

        // Limit to max digits
        if (digits.length > philippines.max) digits = digits.slice(0, philippines.max);

        // Validate first digit
        if (digits.length > 0 && digits[0] !== "9") {
            setErrors((prev) => ({ ...prev, phone: "Philippine numbers must start with 9 after +63" }));
        } else if (digits.length < philippines.min && digits.length > 0) {
            setErrors((prev) => ({ ...prev, phone: `Phone number must be ${philippines.min} digits` }));
        } else {
            setErrors((prev) => ({ ...prev, phone: "" }));
        }

        setRawPhone(digits);

        // Format: 2 2222 2222
        const parts = [];
        const pattern = [2, 4, 4]; // groups of digits
        let start = 0;
        pattern.forEach((len) => {
            if (digits.length > start) {
                parts.push(digits.substr(start, len));
            }
            start += len;
        });

        setPhone(parts.join(" "));
    };


    // Email validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        const domain = value.split("@")[1];
        if (domain && !allowedDomains.includes(domain.toLowerCase())) {
            setErrors((prev) => ({ ...prev, email: "Only @gmail.com and @yahoo.com emails are allowed" }));
        } else {
            setErrors((prev) => ({ ...prev, email: "" }));
        }
    };

    return (
        <div className="w-full p-2">
            <h1 className="text-white font-bold text-2xl">Adding New Contact's</h1>
            <span className="text-xs text-[#9BB3D6]">Manage and add essential contact information for your rider easily.</span>
            <form
                className="flex flex-col gap-4 w-full mt-4"
                onSubmit={(e) => {
                    e.preventDefault();

                    let invalidFields = [];

                    if (!name.trim()) invalidFields.push("Name");
                    if (!phone || errors.phone) invalidFields.push("Contact number");
                    if (!email || errors.email) invalidFields.push("Email");
                    if (!relation) invalidFields.push("Relation");
                    if (relation === "Other" && !customRelation) invalidFields.push("Specify relation");

                    if (invalidFields.length > 0) {
                        setErrors((prev) => ({
                            ...prev,
                            submit: `Please correct the following fields: (${invalidFields.join(", ")})`,
                        }));
                        return;
                    }

                    // Clear submit error if all is valid
                    setErrors((prev) => ({ ...prev, submit: "" }));

                    // Create contact object and pass to parent
                    // Format: +639123456789 (no space, matches registration format)
                    const contactData = {
                        name: name.trim(),
                        relation: relation === "Other" ? customRelation.trim() : relation,
                        contactNo: `${philippines.code}${rawPhone}`,
                        email: email.trim(),
                    };

                    // Call the onAdd callback to add the contact temporarily
                    if (onAdd) {
                        onAdd(contactData);
                    }

                    // Reset form
                    setName("");
                    setRelation("");
                    setCustomRelation("");
                    setPhone("");
                    setEmail("");
                    setRawPhone("");
                    setErrors({ phone: "", email: "" });
                }}
            >
                {/* Name */}
                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Name:</label>
                    <input
                        type="text"
                        required
                        placeholder="Enter contact's name"
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Relation */}
                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Relation:</label>
                    <select
                        className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                    >
                        <option value="" disabled hidden>
                            Select relation
                        </option>
                        <option className="text-white" value="Family">Family</option>
                        <option className="text-white" value="Friend">Friend</option>
                        <option className="text-white" value="Colleague">Colleague</option>
                        <option className="text-white" value="Other">Other</option>
                    </select>

                    {relation === "Other" && (
                        <input
                            type="text"
                            required
                            placeholder="Specify relation"
                            className="bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 mt-2 w-full"
                            value={customRelation}
                            onChange={(e) => setCustomRelation(e.target.value)}
                        />
                    )}
                </div>

                {/* Phone */}
                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Contact (Philippines):</label>
                    <div className="flex gap-2 w-full">
                        <span className="bg-[#0A1A3A] text-gray-200 rounded-md px-3 py-2 flex items-center">
                            {philippines.code}
                        </span>
                        <input
                            type="text"
                            required
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder={philippines.format}
                            className={`bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full ${errors.phone ? "border border-red-500" : ""
                                }`}
                            maxLength={philippines.format.length}
                        />
                    </div>
                    {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col w-full">
                    <label className="text-white font-medium mb-1">Email:</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="example@gmail.com"
                        className={`bg-[#0A1A3A] text-gray-300 rounded-md px-3 py-2 w-full ${errors.email ? "border border-red-500" : ""
                            }`}
                    />
                    {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                </div>
                {errors.submit && (
                    <span className="text-red-500 text-sm mb-2">{errors.submit}</span>
                )}
                <div className="flex justify-end mt-4">
                    <button type="submit" className="cursor-pointer hover:bg-green-700 hover:text-gray-300 text-white px-8 py-2 bg-green-500 rounded-lg font-bold">
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddContactModal;
