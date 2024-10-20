import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-8 rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out max-w-xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-dark">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition duration-200 ease-in-out text-3xl focus:outline-none"
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
