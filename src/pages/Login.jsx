import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slice/authSlice";
import Cookies from "js-cookie";
import { encryptData, decryptData } from "../utils/secureStorage";


const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [openPass, setOpenPass] = useState(false)
    const [user, setUser] = useState(null)
    const REMEMBER_ME_KEY = "rememberedUsers";
    const initialValues = {
        employee_id: "",
        user_name: "",
        password: "",
        rememberMe: false
    };

    const validationSchema = Yup.object({
        employee_id: Yup.string().required("Employee ID is required"),
        user_name: Yup.string().required("User name is required"),
        password: Yup.string()
            .min(6, "password must be at least 6 characters")
            .required("password is required"),
        rememberMe: Yup.boolean()
    });

    const onSubmit = async (values) => {
        const response = await dispatch(login(values));
        if (response?.payload?.success) {
            let rememberedUsers = {};
            const stored = localStorage.getItem(REMEMBER_ME_KEY);
            if (stored) {
                rememberedUsers = JSON.parse(stored);
            }
            if (values.rememberMe) {
                const encrypted = await encryptData({
                    user_name: values.user_name,
                    employee_id: values.employee_id,
                    password: values.password
                });
                rememberedUsers[values.employee_id] = encrypted;
            } else {
                delete rememberedUsers[values.employee_id];
            }
            localStorage.setItem(
                REMEMBER_ME_KEY,
                JSON.stringify(rememberedUsers)
            );
            setUser(response?.payload?.data?.user?.name)
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000)
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit
    });

    useEffect(() => {
        const stored = localStorage.getItem(REMEMBER_ME_KEY);
        if (!stored) return;
        const rememberedUsers = JSON.parse(stored);
        const encryptedUser = rememberedUsers[formik.values.employee_id];
        if (!encryptedUser) return;
        (async () => {
            try {
                const decrypted = await decryptData(encryptedUser);
                formik.setFieldValue("user_name", decrypted.user_name);
                formik.setFieldValue("password", decrypted.password);
                formik.setFieldValue("rememberMe", true);
            } catch (err) {
                console.error("Decryption failed", err);
            }
        })();
    }, [formik.values.employee_id]);


    useEffect(() => {
        const token = Cookies.get("pipeSpool");
        if (token) {
            navigate("/dashboard");
        }
    }, [])

    return (
        <main className="login-page">
            <div className="login-wrap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-7">
                            <div className="login-inner">
                                <div className="logo">
                                    <img src="/images/logo.svg" alt="logo" />
                                </div>

                                <div className="data">
                                    <h1>RPR Spool Tracker</h1>
                                    <p>Shop Floor Management System</p>
                                </div>

                                {/* HTML FORM TAG */}
                                <form onSubmit={formik.handleSubmit} noValidate>
                                    {/* Employee ID */}
                                    <div className="input-field mb-3">
                                        <label>Employee ID</label>
                                        <input
                                            type="text"
                                            name="employee_id"
                                            placeholder="Enter your employee ID"
                                            value={formik.values.employee_id}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.employee_id && formik.errors.employee_id && (
                                            <div className="error-text">{formik.errors.employee_id}</div>
                                        )}
                                    </div>
                                    <div className="input-field mb-3">
                                        <label>User Name</label>
                                        <input
                                            type="text"
                                            name="user_name"
                                            placeholder="Enter your user name"
                                            value={formik.values.user_name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        // className="input-field"
                                        />
                                        {formik.touched.user_name && formik.errors.user_name && (
                                            <div className="error-text" >
                                                {formik.errors.user_name}
                                            </div>
                                        )}
                                    </div>

                                    {/* password */}
                                    <div className="input-field">
                                        <label>Password</label>
                                        <input
                                            type={openPass ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Enter your password"
                                            className="password"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <div className="password-eye" onClick={() => setOpenPass(!openPass)}>
                                            <div className={`eye ${!openPass ? "eye-close" : 'eye-open'}`}></div>
                                        </div>
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="error-text" >
                                                {formik.errors.password}
                                            </div>
                                        )}
                                    </div>
                                    {/* Remember Me */}
                                    <div className="remember-check">
                                        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }} >
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                checked={formik.values.rememberMe}
                                                onChange={formik.handleChange}
                                                style={{
                                                    marginRight: "5px"
                                                }}
                                            />
                                            Remember me
                                        </label>
                                    </div>
                                    {/* Submit */}
                                    <input
                                        type="submit"
                                        value="Login"
                                        className="primary-cta"
                                        disabled={formik.isSubmitting}
                                    />

                                    {(user !== '' && user !== null) && (
                                        <>
                                            <div className="login-message">
                                                <img src="/images/login/green-check.svg" alt="" />
                                                <p>
                                                    Welcome, <span>{user}</span> Redirecting to Shop Floor...
                                                </p>
                                            </div>
                                        </>
                                    )}


                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
};

export default React.memo(Login);