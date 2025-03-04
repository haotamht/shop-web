import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ToastMessage, { success, error, warning } from '~/components/Toast';
import { authApi } from '~/asset/path';

export default function OtpInput({ email, setPage }) {
    const [timerCount, setTimer] = useState(60);
    const [OTPinput, setOTPinput] = useState(['', '', '', '']);
    const [disable, setDisable] = useState(true);
    const inputRefs = useRef([]);

    // Function to focus on the next input
    const focusNextInput = (index) => {
        if (index < OTPinput.length - 1) {
            const nextInput = inputRefs.current[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    useEffect(() => {
        // Start timer for OTP resend
        let interval = setInterval(() => {
            setTimer((lastTimerCount) => {
                lastTimerCount <= 1 && clearInterval(interval);
                if (lastTimerCount <= 1) setDisable(false);
                if (lastTimerCount <= 0) return lastTimerCount;
                return lastTimerCount - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [disable]);

    const handleInputChange = (index, value) => {
        setOTPinput((prevOTP) => {
            const newOTP = [...prevOTP];
            newOTP[index] = value.replace(/[^0-9]/g, ''); // Only allow numeric characters
            return newOTP;
        });
        focusNextInput(index); // Move focus to the next input after changing the current input
    };

    const resendOTP = async () => {
        try {
            if (email) {
                await axios.post(`${authApi}/otp-forgot-password`, { email: email });
                success('Đã gửi OTP');
            } else {
                warning('Vui lòng điền email');
            }
        } catch (er) {
            error(er.message);
            return null;
        }
    };

    const verifyOTP = async () => {
        try {
            if (email) {
                if (OTPinput.includes('') || OTPinput.includes(null)) {
                    throw new Error('OTP thiếu');
                }
                const otpString = OTPinput.join('');

                const result = await axios.post(`${authApi}/submit-otp`, {
                    email: email,
                    otp: otpString,
                });
                const { token } = result.data;
                localStorage.setItem('otp_token', token);
                setPage('submit');
            } else {
                warning('Lỗi');
            }
        } catch (er) {
            error(er.message);
            return null;
        }
    };

    return (
        <div className="pt-[30px] pb-[20px] lg:pt-[105px] lg:pb-[40px] flex justify-center items-center w-screen h-[100%] ">
            <div className="bg-white px-6 border border-gray-200 pt-10 pb-9 mx-auto w-full max-w-lg rounded-[10px]">
                <div className="mx-auto flex w-full max-w-md flex-col space-y-10">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="font-semibold text-3xl">
                            <p>Xác thực Email</p>
                        </div>
                        <div className="flex flex-row text-sm font-medium text-gray-400">
                            <p>Chúng tôi đã gửi mã xác thực đến email {email}</p>
                        </div>
                    </div>

                    <div>
                        <form>
                            <div className="flex flex-col space-y-16">
                                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                                    {OTPinput.map((value, index) => (
                                        <div key={index} className="w-16 h-16">
                                            <input
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                maxLength="1"
                                                className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-black"
                                                type="text"
                                                name=""
                                                inputmode="numeric"
                                                value={value}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col space-y-5">
                                    <div>
                                        <div
                                            onClick={verifyOTP}
                                            className="flex flex-row cursor-pointer items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-black border-none text-white text-sm shadow-sm"
                                        >
                                            Xác Nhận
                                        </div>
                                    </div>

                                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                                        <p>Không nhận được mã ?</p>{' '}
                                        <div
                                            className="flex flex-row items-center"
                                            style={{
                                                color: disable ? 'gray' : '#dc4e3f',
                                                cursor: disable ? 'none' : 'pointer',
                                                textDecorationLine: disable ? 'none' : 'underline',
                                            }}
                                            onClick={resendOTP}
                                        >
                                            {disable ? `Gửi lại OTP trong ${timerCount}s` : 'Gửi lại OTP'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ToastMessage />
        </div>
    );
}
