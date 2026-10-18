import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import ViewCustomer from "./pages/ViewCustomer";
import EditCustomer from "./pages/EditCustomer";

import Contacts from "./pages/Contacts";
import CustomerContacts from "./pages/CustomerContacts";
import AddContact from "./pages/AddContact";
import ViewContact from "./pages/ViewContact";
import EditContact from "./pages/EditContact";

import Interactions from "./pages/Interactions";
import CustomerInteractions from "./pages/CustomerInteractions";
import AddInteraction from "./pages/AddInteraction";
import ViewInteraction from "./pages/ViewInteraction";
import EditInteraction from "./pages/EditInteraction";

import FollowUps from "./pages/FollowUps";
import CustomerFollowUps from "./pages/CustomerFollowUps";
import AddFollowUp from "./pages/AddFollowUp";
import ViewFollowUp from "./pages/ViewFollowUp";
import EditFollowUp from "./pages/EditFollowUp";

import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import ViewTask from "./pages/ViewTask";
import EditTask from "./pages/EditTask";

import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import ViewUser from "./pages/ViewUser";
import EditUser from "./pages/EditUser";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login */}
                <Route path="/" element={<Login />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Customers */}
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/add" element={<AddCustomer />} />
                <Route path="/customers/:id" element={<ViewCustomer />} />
                <Route path="/customers/:id/edit" element={<EditCustomer />} />

                {/* Customer Contacts Flow */}
                <Route
                    path="/customers/:customerId/contacts"
                    element={<CustomerContacts />}
                />
                <Route
                    path="/customers/:customerId/contacts/add"
                    element={<AddContact />}
                />

                {/* General Contacts */}
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contacts/add" element={<AddContact />} />
                <Route path="/contacts/:id" element={<ViewContact />} />
                <Route path="/contacts/:id/edit" element={<EditContact />} />

                {/* Customer Interactions Flow */}
                <Route
                    path="/customers/:customerId/interactions"
                    element={<CustomerInteractions />}
                />
                <Route
                    path="/customers/:customerId/interactions/add"
                    element={<AddInteraction />}
                />

                {/* General Interactions */}
                <Route path="/interactions" element={<Interactions />} />
                <Route path="/interactions/add" element={<AddInteraction />} />
                <Route path="/interactions/:id" element={<ViewInteraction />} />
                <Route path="/interactions/:id/edit" element={<EditInteraction />} />

                {/* Customer Follow-ups Flow */}
                <Route
                    path="/customers/:customerId/follow-ups"
                    element={<CustomerFollowUps />}
                />
                <Route
                    path="/customers/:customerId/follow-ups/add"
                    element={<AddFollowUp />}
                />

                {/* General Follow-ups */}
                <Route path="/follow-ups" element={<FollowUps />} />
                <Route path="/follow-ups/add" element={<AddFollowUp />} />
                <Route path="/follow-ups/:id" element={<ViewFollowUp />} />
                <Route path="/follow-ups/:id/edit" element={<EditFollowUp />} />

                {/* Tasks Flow */}
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/add" element={<AddTask />} />
                <Route path="/tasks/:id" element={<ViewTask />} />
                <Route path="/tasks/:id/edit" element={<EditTask />} />

                {/* User Management (Administrator Only) */}
                <Route path="/users" element={<Users />} />
                <Route path="/users/add" element={<AddUser />} />
                <Route path="/users/:id" element={<ViewUser />} />
                <Route path="/users/:id/edit" element={<EditUser />} />

                {/* Unknown route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;