import {
    useEffect,
    useState,
    type FormEvent,
    type ChangeEvent
} from "react";

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "./EditCustomer.css";


interface CustomerForm {
    customerName: string;
    companyName: string;
    email: string;
    phone: string;

    status: string;
    priority: string;
    category: string;
    source: string;

    businessNature: string;
    businessType: string;

    leadStatus: string;
    customerInterest: string;

    paymentStatus: string;
    verificationStatus: string;
    owner: string;
}

interface SalesExecutive {
    _id: string;
    name: string;
    email: string;
    role: string;
}

function EditCustomer() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] =
        useState<CustomerForm>({
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

    const [loadingExecutives, setLoadingExecutives] =
        useState(false);

    const [userRole, setUserRole] = useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // =====================================================
    // GET USER ROLE
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
            if (
                userRole !== "Administrator" &&
                userRole !== "Manager"
            ) {
                return;
            }

            try {
                setLoadingExecutives(true);
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(
                    "http://localhost:8000/api/users/sales-executives",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = response.data;
                if (Array.isArray(data)) {
                    setSalesExecutives(data);
                } else if (Array.isArray(data.users)) {
                    setSalesExecutives(data.users);
                } else if (Array.isArray(data.salesExecutives)) {
                    setSalesExecutives(data.salesExecutives);
                } else {
                    setSalesExecutives([]);
                }
            } catch (err: any) {
                console.error("Failed to load sales executives", err);
            } finally {
                setLoadingExecutives(false);
            }
        };

        fetchSalesExecutives();
    }, [userRole]);


    // =====================================================
    // LOAD CUSTOMER
    // =====================================================

    useEffect(() => {

        const fetchCustomer = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                if (!token) {
                    setError("Please login again.");
                    setLoading(false);
                    return;
                }


                if (!id) {
                    setError("Customer ID is missing.");
                    setLoading(false);
                    return;
                }


                const response =
                    await axios.get(
                        `http://localhost:8000/api/customers/${id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const customer =
                    response.data;


                setFormData({
                    customerName:
                        customer.customerName || "",

                    companyName:
                        customer.companyName || "",

                    email:
                        customer.email || "",

                    phone:
                        customer.phone || "",

                    status:
                        customer.status || "Active",

                    priority:
                        customer.priority || "AVERAGE",

                    category:
                        customer.category || "",

                    source:
                        customer.source || "",

                    businessNature:
                        customer.businessNature || "",

                    businessType:
                        customer.businessType || "",

                    leadStatus:
                        customer.leadStatus || "Cold",

                    customerInterest:
                        customer.customerInterest || "",

                    paymentStatus:
                        customer.paymentStatus || "Pending",

                    verificationStatus:
                        customer.verificationStatus || "",

                    owner:
                        customer.owner?._id || customer.owner || ""
                });

            } catch (error: any) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load customer"
                );

            } finally {

                setLoading(false);

            }
        };


        fetchCustomer();

    }, [id]);


    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {

        const { name, value } =
            event.target;


        setFormData((current) => ({
            ...current,
            [name]: value
        }));
    };


    // =====================================================
    // UPDATE CUSTOMER
    // =====================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);


        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                setError(
                    "Please login again."
                );

                return;
            }


            if (!id) {

                setError(
                    "Customer ID is missing."
                );

                return;
            }


            const updatePayload: any = {
                customerName: formData.customerName,
                companyName: formData.companyName,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                priority: formData.priority,
                category: formData.category,
                source: formData.source,
                businessNature: formData.businessNature,
                businessType: formData.businessType,
                leadStatus: formData.leadStatus,
                customerInterest: formData.customerInterest,
                paymentStatus: formData.paymentStatus,
                verificationStatus: formData.verificationStatus
            };

            // Only Administrator and Manager can change or reassign the owner
            if (userRole === "Administrator" || userRole === "Manager") {
                if (formData.owner) {
                    updatePayload.owner = formData.owner;
                }
            }

            await axios.put(
                `http://localhost:8000/api/customers/${id}`,
                updatePayload,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            setSuccess(
                "Customer updated successfully! Redirecting to customers..."
            );


            // Go to Customers page where customer information is stored
            setTimeout(() => {
                navigate("/customers");
            }, 500);


        } catch (error: any) {

            console.error(
                "UPDATE CUSTOMER ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to update customer"
            );

        } finally {

            setSaving(false);

        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="edit-customer-layout">

                <Sidebar />

                <main className="edit-customer-main">

                    <p>
                        Loading customer...
                    </p>

                </main>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="edit-customer-layout">

            <Sidebar />

            <main className="edit-customer-main">

                <header className="edit-customer-header">

                    <div>

                        <h1>
                            Edit Customer
                        </h1>

                        <p>
                            Update customer information.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate("/customers")}
                    >
                        &larr; Back to Customers
                    </button>

                </header>


                <section className="edit-customer-card">

                    {error && (
                        <div className="edit-customer-error">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="edit-customer-success">
                            {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

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
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
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
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            LEAD & SALES
                        ===================================================== */}

                        <div className="form-section">

                            <h2>
                                Lead & Sales
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
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
}


export default EditCustomer;