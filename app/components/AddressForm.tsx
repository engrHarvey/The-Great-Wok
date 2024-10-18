import React from 'react';

interface Address {
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface AddressFormProps {
  newAddress: Address;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAddress: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ newAddress, onAddressChange, onAddAddress }) => {
  return (
    <div className="bg-white shadow-2xl rounded-lg p-8 mb-12">
      <h3 className="text-3xl font-bold text-secondary mb-8">Add New Address</h3>
      <form onSubmit={onAddAddress}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Line */}
          <div className="col-span-2">
            <label htmlFor="address_line" className="block text-lg font-semibold mb-2 text-gray-800">Address Line</label>
            <input
              type="text"
              id="address_line"
              name="address_line"
              value={newAddress.address_line}
              onChange={onAddressChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 bg-white shadow-sm transition-all duration-200 ease-in-out"
              required
            />
          </div>
          
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-lg font-semibold mb-2 text-gray-800">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={newAddress.city}
              onChange={onAddressChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 bg-white shadow-sm transition-all duration-200 ease-in-out"
              required
            />
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-lg font-semibold mb-2 text-gray-800">State</label>
            <input
              type="text"
              id="state"
              name="state"
              value={newAddress.state}
              onChange={onAddressChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 bg-white shadow-sm transition-all duration-200 ease-in-out"
              required
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-lg font-semibold mb-2 text-gray-800">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={newAddress.country}
              onChange={onAddressChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 bg-white shadow-sm transition-all duration-200 ease-in-out"
              required
            />
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postal_code" className="block text-lg font-semibold mb-2 text-gray-800">Postal Code</label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={newAddress.postal_code}
              onChange={onAddressChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 bg-white shadow-sm transition-all duration-200 ease-in-out"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-6 bg-primary text-white py-3 rounded-full hover:bg-accent transition-all duration-300 ease-in-out shadow-lg"
        >
          Add Address
        </button>
      </form>
    </div>
  );
};

export default AddressForm;