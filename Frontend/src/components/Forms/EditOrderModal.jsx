import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { baseUrl } from '../../utils/constants/Constants';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DRESS_TYPES = [
    { value: 'SHIRT', label: 'Shirt' },
    { value: 'SUIT', label: 'Suit' },
];

const ORDER_STATUSES = [
    { value: 'STARTED', label: 'Started' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FINISHED', label: 'Finished' },
];

const EditOrderModal = ({ orderId, isOpen, onClose, onOrderUpdated }) => {
    const { control, handleSubmit, setValue, watch } = useForm();
    const [pictureUrl, setPictureUrl] = useState(null);

    const amountPerPiece = watch('amount_per_piece');
    const quantity = watch('quantity');
    const advanceAmount = watch('advance_amount');
    const finishingDate = watch('finishing_date');

    useEffect(() => {
        if (orderId && isOpen) {
            const fetchOrder = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/auth/orders/${orderId}/`);
                    const order = response.data;
                    // Set form values with fetched order data
                    Object.keys(order).forEach((key) => setValue(key, order[key]));

                    // Set picture URL
                    if (order.sketch_picture) {
                        setPictureUrl(order.sketch_picture);
                    }
                } catch (error) {
                    console.error('Error fetching order:', error);
                }
            };

            fetchOrder();
        }
    }, [orderId, isOpen, setValue]);

    const onSubmit = async (data) => {
        try {
            // Exclude the sketch_picture from the data being sent
            const { sketch_picture, ...updatedData } = data;
            
            await axios.put(`${baseUrl}/auth/orders/${orderId}/`, updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            toast.success("Order updated successfully");
            onOrderUpdated(); // Notify parent component about the update
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const remainingBalance = (amountPerPiece * quantity) - advanceAmount;

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-md shadow-md w-full max-w-lg relative max-h-[800px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-4">Edit Order</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Existing fields */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Customer Name</label>
                        <Controller
                            name="customer_name"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Contact Number</label>
                        <Controller
                            name="customer_contact_number"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Dress Type</label>
                        <Controller
                            name="dress_type"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Dress Type</option>
                                    {DRESS_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Order Status</label>
                        <Controller
                            name="order_status"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Status</option>
                                    {ORDER_STATUSES.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Advance Amount</label>
                        <Controller
                            name="advance_amount"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Amount Per Piece</label>
                        <Controller
                            name="amount_per_piece"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Quantity</label>
                        <Controller
                            name="quantity"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="number"
                                    {...field}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Finishing Date</label>
                        <Controller
                            name="finishing_date"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    selected={field.value ? new Date(field.value) : null}
                                    onChange={(date) => field.onChange(date)}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    dateFormat="yyyy-MM-dd"
                                />
                            )}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Remaining Balance to Pay</label>
                        <input
                            type="text"
                            value={remainingBalance.toFixed(2)}
                            readOnly
                            className="w-full px-3 py-2 border rounded-md bg-gray-100"
                        />
                    </div>
                    {/* Picture Preview */}
                    {pictureUrl && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Sketch Picture</label>
                            <img
                                src={pictureUrl}
                                alt="Sketch"
                                className="w-full h-auto border rounded-md"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Update
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default EditOrderModal;
