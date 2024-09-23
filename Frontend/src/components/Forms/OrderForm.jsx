import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { baseUrl } from '../../utils/constants/Constants';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DRESS_TYPES = [
    { value: 'SHIRT', label: 'Shirt' },
    { value: 'SUIT', label: 'Suit' },
    // Add more dress types here
];

const OrderForm = () => {
    const { control, handleSubmit, register, reset } = useForm({
        defaultValues: {
            customer_name: '',
            customer_contact_number: '',
            dress_type: '',
            shoulder: '',
            bustline: '',
            chest: '',
            round: '',
            height_of_dress: '',
            amount_per_piece: '',
            quantity: '',
            advance_amount: '',
            comment: '',
            tailor_name: '',
            finishing_date: '',
            sketch_picture: '',
        },
    });

    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
            if (data.sketch_picture.length > 0) {
                formData.append('sketch_picture', data.sketch_picture[0]);
            }
            const response = await axios.post(baseUrl + '/auth/orders/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Order created:', response.data);
            toast.success("Order created");

            // Clear the form
            reset();

            // Navigate to another page
            navigate('/orders'); // Replace with your target path
            
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold mb-6">Create Order</h2>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Customer Name</label>
                    <input
                        {...register('customer_name', { required: true })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Contact Number</label>
                    <input
                        {...register('customer_contact_number', { required: true })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2">
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
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Shoulder</label>
                    <input
                        {...register('shoulder', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Bustline</label>
                    <input
                        {...register('bustline', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2">
                    <label className="block text-gray-700 font-bold mb-2">Chest</label>
                    <input
                        {...register('chest', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Round</label>
                    <input
                        {...register('round', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Height of Dress</label>
                    <input
                        {...register('height_of_dress', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2">
                    <label className="block text-gray-700 font-bold mb-2">Amount Per Piece</label>
                    <input
                        {...register('amount_per_piece', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Quantity</label>
                    <input
                        {...register('quantity', { required: true })}
                        type="number"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2 mb-4 sm:mb-0">
                    <label className="block text-gray-700 font-bold mb-2">Advance Amount</label>
                    <input
                        {...register('advance_amount', { required: true })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="w-full sm:w-1/2 lg:w-1/3 px-2">
                    <label className="block text-gray-700 font-bold mb-2">Finishing Date</label>
                    <input
                        {...register('finishing_date', { required: true })}
                        type="date"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full px-2 mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Tailor Name</label>
                    <input
                        {...register('tailor_name', { required: true })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full px-2">
                    <label className="block text-gray-700 font-bold mb-2">Comment</label>
                    <textarea
                        {...register('comment')}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full px-2">
                    <label className="block text-gray-700 font-bold mb-2">Sketch Picture</label>
                    <input
                        {...register('sketch_picture')}
                        type="file"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 mt-4 text-white bg-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                Submit
            </button>
        </form>
    );
};

export default OrderForm;
