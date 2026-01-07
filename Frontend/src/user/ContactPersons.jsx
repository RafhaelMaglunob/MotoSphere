import React, { useState } from 'react'
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

function ContactPersons() {
  const { contacts, isLight } = useOutletContext();
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [data, setData] = useState();
  // Temporary contacts stored in component state (will be lost on refresh)
  const [temporaryContacts, setTemporaryContacts] = useState([]);
  // Keep track of removed original contacts by their original index
  const [removedOriginalIndices, setRemovedOriginalIndices] = useState([]);
  const [editedOriginals, setEditedOriginals] = useState({});

  const [editIndex, setEditIndex] = useState(null);
  const [isEditingTemporary, setIsEditingTemporary] = useState(false);

  // Build a map of visible original indices (indexes into the `contacts` prop)
  const originalIndexMap = contacts.reduce((acc, _, i) => {
    if (!removedOriginalIndices.includes(i)) acc.push(i);
    return acc;
  }, []);

  // Visible originals (filtered) and then temporary contacts appended
  const visibleOriginals = originalIndexMap.map(i => editedOriginals[i] ? editedOriginals[i] : contacts[i]);
  const allContacts = [...visibleOriginals, ...temporaryContacts];

  const handleDelete = (index) => {
    // If the index belongs to a temporary contact (appended after originals)
    if (index >= visibleOriginals.length) {
      const tempIndex = index - visibleOriginals.length;
      setTemporaryContacts(prev => prev.filter((_, i) => i !== tempIndex));
    } else {
      // It's an original contact — mark it as removed in component state
      const originalIndex = originalIndexMap[index];
      setRemovedOriginalIndices(prev => [...prev, originalIndex]);
    }
  };

  const handleSaveEdit = (updatedContact) => {
    if (isEditingTemporary) {
      const tempIndex = editIndex - visibleOriginals.length;
      setTemporaryContacts(prev => prev.map((c, i) => (i === tempIndex ? updatedContact : c)));
    } else {
      const originalIndex = originalIndexMap[editIndex];
      setEditedOriginals(prev => ({ ...prev, [originalIndex]: updatedContact }));
    }
    setEditModalOpen(false);
    setEditIndex(null);
    setIsEditingTemporary(false);
  }

  const handleAddContact = (newContact) => {
    // Add to temporary contacts (will be lost on refresh)
    setTemporaryContacts(prev => [...prev, newContact]);
    setAddModalOpen(false);
  };


  return (
    <div className="p-4">
      <div>
        <h1 className={`${isLight ? "text-black" : "text-white"} text-3xl font-semibold`}>Trusted Contacts</h1>
        <span className={`${isLight ? "text-black/88" : "text-[#9BB3D6]"} text-sm`}>Manage who gets notified in case of an emergency.</span>
      </div>
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
                    setDeleteIndex(index); // store which contact to delete
                    setConfirmOpen(true); // show modal
                  }}
                  className={`${isLight ? "bg-black/20" : "bg-[#0A1A3A]"} p-2 rounded-lg`}
                >
                  <DeleteIcon color={isLight ? "#000" : "#9BB3D6"} />
                </span>

                <span
                  onClick={() => {
                    setEditModalOpen(true);
                    setData(contact);
                    setEditIndex(index);
                    setIsEditingTemporary(index >= visibleOriginals.length);
                  }
                  }
                  className={`${isLight ? "bg-black/20" : "bg-[#0A1A3A]"} p-2 rounded-lg`}
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
        <div onClick={() => setAddModalOpen((prev) => !prev)} className={`${isLight ? "bg-white" : "bg-none border border-[#334155]"} cursor-pointer p-6 rounded-2xl w-full min-h-[170px] flex flex-col gap-3 items-center justify-center`}>
          <span className={`${isLight ? "bg-black/20" : "bg-[#1E293B]"} rounded-4xl p-4 `}>
            <PlusIcon color="rgba(0,0,0,0.7)"
            />
          </span>
          <h1 className={`${isLight ? "text-black/80" : "text-[#94A3B8]"} font-semibold text-md`}>Add New Contact</h1>
          <span className={`${isLight ? "text-[#475569]" : "text-gray-500"} text-xs`}>Up to 5 contacts allowed</span>
        </div>
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
        onConfirm={() => {
          handleDelete(deleteIndex);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />



    </div>
  )
}

export default ContactPersons
