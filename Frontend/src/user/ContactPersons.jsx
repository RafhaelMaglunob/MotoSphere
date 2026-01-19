import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

import { ProfileIconOutline } from '../component/svg/ProfileIconOutline';
import PhoneIcon from '../component/svg/PhoneIcon';
import MailIcon from '../component/svg/MailIcon';
import DeleteIcon from '../component/svg/DeleteIcon';
import EditIcon from '../component/svg/EditIcon';
import PlusIcon from '../component/svg/PlusIcon';

// Modals
import AddContactModal from '../component/modal/AddContactModal';
import EditContactModal from '../component/modal/EditContactModal';
import ConfirmModal from '../component/modal/ConfirmModal';
import { authAPI } from '../services/api';

function ContactPersons() {
  const { contacts, setContacts, isLight } = useOutletContext();
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [deleteContactId, setDeleteContactId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allContacts = contacts || [];

  const handleDelete = async () => {
    if (!deleteContactId) return;

    try {
      setLoading(true);
      setError("");
      const response = await authAPI.deleteContact(deleteContactId);

      if (response.success) {
        // Remove from local state
        setContacts(prev => prev.filter(c => c.id !== deleteContactId));
        setConfirmOpen(false);
        setDeleteContactId(null);
      } else {
        setError(response.message || "Failed to delete contact");
      }
    } catch (err) {
      setError(err.message || "Failed to delete contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (updatedContact) => {
    if (!data || !data.id) return;

    try {
      setLoading(true);
      setError("");
      const response = await authAPI.updateContact(data.id, {
        name: updatedContact.name,
        relation: updatedContact.relation,
        contactNo: updatedContact.contactNo,
        email: updatedContact.email
      });

      if (response.success) {
        // Update local state
        setContacts(prev => prev.map(c => 
          c.id === data.id ? response.contact : c
        ));
        setEditModalOpen(false);
        setData(null);
      } else {
        setError(response.message || "Failed to update contact");
      }
    } catch (err) {
      setError(err.message || "Failed to update contact. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleAddContact = async (newContact) => {
    // Check if we've reached the limit of 5 contacts
    if (allContacts.length >= 5) {
      setError("Maximum of 5 contacts allowed. Please delete a contact before adding a new one.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await authAPI.addContact({
        name: newContact.name,
        relation: newContact.relation,
        contactNo: newContact.contactNo,
        email: newContact.email
      });

      if (response.success) {
        // Add to local state
        setContacts(prev => [...prev, response.contact]);
        setAddModalOpen(false);
      } else {
        setError(response.message || "Failed to add contact");
      }
    } catch (err) {
      setError(err.message || "Failed to add contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-4">
      <div>
        <h1 className={`${isLight ? "text-black" : "text-white"} text-3xl font-semibold`}>Trusted Contacts</h1>
        <span className={`${isLight ? "text-black/88" : "text-[#9BB3D6]"} text-sm`}>Manage who gets notified in case of an emergency.</span>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-3 mt-6">
        {/* name, relation, contactNo, email */}
        {allContacts.map((contact, index) => (
          // This automatically create a contact information container
          <div key={index} className={`${isLight ? "bg-white" : "bg-[#0F2A52] to-black"} w-full min-h-[170px] w-100 p-6 rounded-2xl`}>
            <div className="grid grid-cols-4">
              <div className="col-span-3 flex flex-row gap-2">
                <div className={`${isLight ? "bg-transparent border border-black/30" : "bg-[#0A1A3A]"} p-3 w-fit rounded-xl`}>
                  <ProfileIconOutline stroke={isLight ? "#000000" : "#22D3EE"} className="h-9 w-9" />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className={`${isLight ? "text-black" : "text-white"} font-semibold text-md`}>{contact.name}</h1>
                  <span className={`${isLight ? "bg-[#000000]/20 text-black/88" : "bg-[#06B6D4]/10 text-[#22D3EE]"} rounded-md w-fit text-xs px-3 py-1`}>{contact.relation}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-row h-fit gap-2 w-full justify-end">
                <span
                  onClick={() => {
                    setDeleteContactId(contact.id);
                    setConfirmOpen(true);
                  }}
                  className={`${isLight ? "bg-black/20" : "bg-[#0A1A3A]"} p-2 rounded-lg cursor-pointer`}
                >
                  <DeleteIcon color={isLight ? "#000" : "#9BB3D6"} />
                </span>

                <span
                  onClick={() => {
                    setEditModalOpen(true);
                    setData(contact);
                  }}
                  className={`${isLight ? "bg-black/20" : "bg-[#0A1A3A]"} p-2 rounded-lg cursor-pointer`}
                >
                  <EditIcon color={isLight ? "#000" : "#9BB3D6"} />
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <div className={`${isLight ? "text-black/88" : "text-[#9BB3D6]"} flex flex-row items-center gap-3 text-sm font-light`}>
                <PhoneIcon className="w-4 h-4" color={isLight ? "#000" : "#22D3EE"} />
                {contact.contactNo}
              </div>
              <div className={`${isLight ? "text-black/88" : "text-[#9BB3D6]"} flex flex-row items-center gap-3 text-sm font-light`}>
                <MailIcon innerColor={isLight ? "#000" : "#22D3EE"} borderColor={isLight ? "#000" : '#22D3EE'} className="w-4 h-4" />
                {contact.email}
              </div>
            </div>
          </div>
        ))}

        {/* Add Contacts */}
        {allContacts.length < 5 && (
          <div onClick={() => setAddModalOpen((prev) => !prev)} className={`${isLight ? "bg-white" : "bg-none border border-[#334155]"} cursor-pointer p-6 rounded-2xl w-full min-h-[170px] flex flex-col gap-3 items-center justify-center`}>
            <span className={`${isLight ? "bg-black/20" : "bg-[#1E293B]"} rounded-4xl p-4 `}>
              <PlusIcon color="rgba(0,0,0,0.7)"
              />
            </span>
            <h1 className={`${isLight ? "text-black/80" : "text-[#94A3B8]"} font-semibold text-md`}>Add New Contact</h1>
            <span className={`${isLight ? "text-[#475569]" : "text-gray-500"} text-xs`}>Up to 5 contacts allowed</span>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 p-5 flex items-center justify-center bg-black/40 bg-opacity-50">
          {/* Modal container */}
          <div className="bg-[#0F2A52] rounded-2xl w-full max-w-2xl p-6 relative">

            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white text-xl font-bold cursor-pointer hover:text-gray-500"
              onClick={() => setAddModalOpen(false)}
            >
              &times;
            </button>

            {/* Modal content */}
            <AddContactModal onAdd={handleAddContact} onClose={() => setAddModalOpen(false)} />
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 p-5 flex items-center justify-center bg-black/40 bg-opacity-50">
          {/* Modal container */}
          <div className="bg-[#0F2A52] rounded-2xl w-full max-w-2xl p-6 relative">

            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white text-xl font-bold cursor-pointer hover:text-gray-500"
              onClick={() => setEditModalOpen(false)}
            >
              &times;
            </button>

            {/* Modal content */}
            <EditContactModal data={data} onSave={handleSaveEdit} onClose={() => setEditModalOpen(false)} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        message="Are you sure you want to delete this contact?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteContactId(null);
        }}
      />



    </div>
  )
}

export default ContactPersons
