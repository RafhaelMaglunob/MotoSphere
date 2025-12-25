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
  const { contacts } = useOutletContext();
  const [isAddModalOpen, setAddModalOpen] = useState(false)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [data, setData] = useState();

  const handleDelete = (index) => {
    const updatedContacts = [...contacts];
    // Backend logic
  };


  return (
    <div className="p-4">
      <div>
        <h1 className="text-white text-3xl font-semibold">Trusted Contacts</h1>
        <span className="text-[#9BB3D6] text-sm">Manage who gets notified in case of an emergency.</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-6">
        {/* name, relation, contactNo, email */}
        {contacts.map((contact, index) => (
          // This automatically create a contact information container
          <div key={index} className="w-full min-h-[170px] bg-[#0F2A52] w-100 to-black p-6 rounded-2xl">
            <div className="grid grid-cols-4">
              <div className="col-span-3 flex flex-row gap-2">
                <div className="bg-[#0A1A3A] p-3 w-fit rounded-xl">
                  <ProfileIconOutline className="text-[#22D3EE] h-9 w-9" />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-white font-semibold text-md">{contact.name}</h1>
                  <span className="bg-[#06B6D4]/10 text-[#22D3EE] rounded-md w-fit text-xs px-3 py-1">{contact.relation}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-row h-fit gap-2 w-full justify-end">
                <span
                  onClick={() => {
                    setDeleteIndex(index); // store which contact to delete
                    setConfirmOpen(true); // show modal
                  }}
                  className="bg-[#0A1A3A] p-2 rounded-lg cursor-pointer"
                >
                  <DeleteIcon />
                </span>

                <span
                  onClick={() => {
                    setEditModalOpen((prev) => !prev)
                    setData(contact)
                  }
                  }
                  className="bg-[#0A1A3A] p-2 rounded-lg"
                >
                  <EditIcon />
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <div className="flex flex-row items-center gap-3 text-[#9BB3D6] text-sm font-light">
                <PhoneIcon className="w-4 h-4" color="#22D3EE" />
                {contact.contactNo}
              </div>
              <div className="flex flex-row items-center gap-3 text-[#9BB3D6] text-sm font-light">
                <MailIcon innerColor={"#22D3EE"} borderColor='#22D3EE' className="w-4 h-4" />
                {contact.email}
              </div>
            </div>
          </div>
        ))}

        {/* Add Contacts */}
        <div onClick={() => setAddModalOpen((prev) => !prev)} className="bg-none cursor-pointer p-6 rounded-2xl w-full min-h-[170px] flex flex-col gap-3 items-center justify-center border border-[#334155]">
          <span className="bg-[#1E293B] rounded-4xl p-4 ">
            <PlusIcon />
          </span>
          <h1 className="text-[#94A3B8] font-semibold text-md">Add New Contact</h1>
          <span className="text-gray-500 text-xs">Up to 5 contacts allowed</span>
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
            <AddContactModal />
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
            <EditContactModal data={data} />
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
