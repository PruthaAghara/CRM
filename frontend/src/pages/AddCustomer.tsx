import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "./AddCustomer.css";

interface SalesExecutive {
    _id: string;
    name: string;
    email: string;
    role: string;
}

function AddCustomer() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        customerName: "",
        companyName: "",
        email: "",
        phone: "",
        status: "Active",
        priority: "AVERAGE",
        category: "",
        source: "",
        businessNature: "",
        businessType: "",
        leadStatus: "Cold",
        customerInterest: "",
        paymentStatus: "Pending",
        verificationStatus: "",
        owner: ""
    });

    const [salesExecutives, setSalesExecutives] =
        useState<SalesExecutive[]>([]);

    const [userRole, setUserRole] = useState("");

    const [loading, setLoading] = useState(false);

    const [loadingExecutives, setLoadingExecutives] =
        useState(false);

    const [error, setError] = useState("");


    // =====================================================
    // GET LOGGED-IN USER ROLE
    // =====================================================

    useEffect(() => {
        let role = localStorage.getItem("role");
        if (!role) {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const parsed = JSON.parse(userStr);
                    role = parsed.role;
                } catch (e) {}
            }
        }
        if (role) {
            setUserRole(role);
        }
    }, []);


    // =====================================================
    // LOAD SALES EXECUTIVES
    // =====================================================

    useEffect(() => {

        const fetchSalesExecutives = async () => {

            // Sales Executive does not need
            // the owner dropdown.
            if (
                userRole !== "Administrator" &&
                userRole !== "Manager"
            ) {
                return;
            }

            try {

                setLoadingExecutives(true);

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    setError("Please login again.");
                    return;
                }


                /*
                 * IMPORTANT:
                 * This endpoint must return users with
                 * role = "Sales Executive".
                 *
                 * Change this URL only if your User
                 * route uses a different endpoint.
                 */

                const response =
                    await axios.get(
                        "http://localhost:8000/api/users/sales-executives",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    response.data;


                if (Array.isArray(data)) {

                    setSalesExecutives(data);

                }
                else if (
                    Array.isArray(data.users)
                ) {

                    setSalesExecutives(
                        data.users
                    );

                }
                else if (
                    Array.isArray(data.salesExecutives)
                ) {

                    setSalesExecutives(
                        data.salesExecutives
                    );

                }
                else {

                    setSalesExecutives([]);

                }

            } catch (error: any) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load Sales Executives"
                );

            } finally {

                setLoadingExecutives(false);

            }

        };


        fetchSalesExecutives();

    }, [userRole]);


    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {

        const {
            name,
            value
        } = event.target;


        setFormData((current) => ({

            ...current,

            [name]: value

        }));

    };


    // =====================================================
    // CREATE CUSTOMER
    // =====================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError("");
        setLoading(true);


        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                setError(
                    "Please login again."
                );

                return;

            }


            // =================================================
            // PREPARE DATA
            // =================================================

            const customerData = {

                customerName:
                    formData.customerName,

                companyName:
                    formData.companyName,

                email:
                    formData.email,

                phone:
                    formData.phone,

                status:
                    formData.status,

                priority:
                    formData.priority,

                category:
                    formData.category,

                source:
                    formData.source,

                businessNature:
                    formData.businessNature,

                businessType:
                    formData.businessType,

                leadStatus:
                    formData.leadStatus,

                customerInterest:
                    formData.customerInterest,

                paymentStatus:
                    formData.paymentStatus,

                verificationStatus:
                    formData.verificationStatus

            };


            // =================================================
            // ADMIN / MANAGER OWNER
            // =================================================

            if (
                userRole === "Administrator" ||
                userRole === "Manager"
            ) {

                if (!formData.owner) {

                    setError(
                        "Please select a Sales Executive."
                    );

                    setLoading(false);
                    return;

                }


                (
                    customerData as typeof customerData & {
                        owner: string;
                    }
                ).owner = formData.owner;

            }


            // =================================================
            // SALES EXECUTIVE
            // =================================================

            /*
             * For Sales Executive:
             *
             * Do NOT send owner.
             *
             * Backend automatically uses:
             *
             * req.user.userId
             */


            // =================================================
            // API REQUEST
            // =================================================

            await axios.post(

                "http://localhost:8000/api/customers",

                customerData,

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


            // =================================================
            // SUCCESS
            // =================================================

            navigate("/customers");


        } catch (error: any) {

            console.error(
                "CREATE CUSTOMER ERROR:",
                error
            );


            setError(

                error.response?.data?.message ||

                error.response?.data?.error ||

                error.message ||

                "Failed to create customer"

            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="add-customer-layout">

            <Sidebar />


            <main className="add-customer-main">


                {/* =====================================================
                    HEADER
                ===================================================== */}

                <header className="add-customer-header">

                    <div>

                        <h1>
                            Add Customer
                        </h1>

                        <p>
                            Add a new customer to your CRM.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate("/customers")
                        }
                    >
                        Back to Customers
                    </button>

                </header>


                {/* =====================================================
                    CARD
                ===================================================== */}

                <section className="add-customer-card">


                    {/* ERROR */}

                    {error && (

                        <div className="add-customer-error">

                            {error}

                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =====================================================
                            BASIC INFORMATION
                        ===================================================== */}

                        <div className="form-section">

                            <h2>
                                Basic Information
                            </h2>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Customer Name
                                    </label>

                                    <input
                                        type="text"
                                        name="customerName"
                                        value={
                                            formData.customerName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter customer name"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Company Name
                                    </label>

                                    <input
                                        type="text"
                                        name="companyName"
                                        value={
                                            formData.companyName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter company name"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter email"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter phone number"
                                        required
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            CUSTOMER CLASSIFICATION
                        ===================================================== */}

                        <div className="form-section">

                            <h2>
                                Customer Classification
                            </h2>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Priority
                                    </label>

                                    <select
                                        name="priority"
                                        value={
                                            formData.priority
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="HIGH">
                                            High
                                        </option>

                                        <option value="MEDIUM">
                                            Medium
                                        </option>

                                        <option value="LOW">
                                            Low
                                        </option>

                                        <option value="AVERAGE">
                                            Average
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        name="category"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Enterprise"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Source
                                    </label>

                                    <input
                                        type="text"
                                        name="source"
                                        value={
                                            formData.source
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Website"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            BUSINESS INFORMATION
                        ===================================================== */}

                        <div className="form-section">

                            <h2>
                                Business Information
                            </h2>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Business Nature
                                    </label>

                                    <input
                                        type="text"
                                        name="businessNature"
                                        value={
                                            formData.businessNature
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Manufacturing"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Business Type
                                    </label>

                                    <input
                                        type="text"
                                        name="businessType"
                                        value={
                                            formData.businessType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. B2B"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            LEAD INFORMATION
                        ===================================================== */}

                        <div className="form-section">

                            <h2>
                                Lead Information
                            </h2>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Lead Status
                                    </label>

                                    <select
                                        name="leadStatus"
                                        value={
                                            formData.leadStatus
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="Hot">
                                            Hot
                                        </option>

                                        <option value="Warm">
                                            Warm
                                        </option>

                                        <option value="Cold">
                                            Cold
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Customer Interest
                                    </label>

                                    <input
                                        type="text"
                                        name="customerInterest"
                                        value={
                                            formData.customerInterest
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Premium Plan"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            PAYMENT & VERIFICATION
                        ===================================================== */}

                        <div className="form-section">

                            <h2>
                                Payment & Verification
                            </h2>


                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Payment Status
                                    </label>

                                    <select
                                        name="paymentStatus"
                                        value={
                                            formData.paymentStatus
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="Partial">
                                            Partial
                                        </option>

                                        <option value="Paid">
                                            Paid
                                        </option>

                                        <option value="Overdue">
                                            Overdue
                                        </option>

                                    </select>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Verification Status
                                    </label>

                                    <select
                                        name="verificationStatus"
                                        value={
                                            formData.verificationStatus
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Not Verified
                                        </option>

                                        <option value="Verified">
                                            Verified
                                        </option>

                                        <option value="Pending">
                                            Pending
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            OWNER
                        ===================================================== */}

                        {(
                            userRole === "Administrator" ||
                            userRole === "Manager"
                        ) && (

                            <div className="form-section">

                                <h2>
                                    Customer Owner
                                </h2>


                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Sales Executive
                                        </label>

                                        <select
                                            name="owner"
                                            value={
                                                formData.owner
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            disabled={
                                                loadingExecutives
                                            }
                                        >

                                            <option value="">

                                                {loadingExecutives
                                                    ? "Loading Sales Executives..."
                                                    : "Select Sales Executive"}

                                            </option>


                                            {salesExecutives.map(
                                                (executive) => (

                                                    <option
                                                        key={
                                                            executive._id
                                                        }
                                                        value={
                                                            executive._id
                                                        }
                                                    >

                                                        {executive.name}
                                                        {" - "}
                                                        {executive.email}

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =====================================================
                            ACTIONS
                        ===================================================== */}

                        <div className="form-actions">


                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    navigate("/customers")
                                }
                                disabled={loading}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="save-button"
                                disabled={
                                    loading ||
                                    loadingExecutives
                                }
                            >

                                {loading
                                    ? "Creating..."
                                    : "Create Customer"}

                            </button>

                        </div>


                    </form>

                </section>

            </main>

        </div>

    );
}

export default AddCustomer;