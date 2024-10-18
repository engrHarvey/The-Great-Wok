import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

interface CartItem {
  cart_item_id: number;
  dish_name: string;
  quantity: number;
  price: number;
}

interface CartItemRowProps {
  item: CartItem;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onIncrease, onDecrease, onRemove }) => (
  <tr className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200 ease-in-out">
    <td className="py-4 px-6 text-gray-700">{item.dish_name}</td>
    <td className="py-4 px-6 text-dark font-medium flex items-center">
      <button
        onClick={() => onDecrease(item.cart_item_id)}
        className="bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-400 transition-all ease-in-out"
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <span className="mx-3">{item.quantity}</span>
      <button
        onClick={() => onIncrease(item.cart_item_id)}
        className="bg-green-500 text-white px-2 py-1 rounded-full hover:bg-green-400 transition-all ease-in-out"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </td>
    <td className="py-4 px-6 text-gray-700">
      {`₱${(Number(item.price) ? Number(item.price).toFixed(2) : '0.00')}`}
    </td>
    <td className="py-4 px-6 text-gray-700">
      {`₱${(Number(item.price) * item.quantity).toFixed(2)}`}
    </td>
    <td
      className="py-4 px-6 text-red-600 cursor-pointer"
      onClick={() => onRemove(item.cart_item_id)}
    >
      <FontAwesomeIcon icon={faTrash} />
    </td>
  </tr>
);

export default CartItemRow;