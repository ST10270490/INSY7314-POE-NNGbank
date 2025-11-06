
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import StaffLogin from './Staff-Login';
import Accounts from './Accounts';
import StaffPayments from './StaffPayments';
import Payments from './Payments';
import CreatePayment from './CreatePayment';

export default function App() {
  return (

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/register" element={<Register />} />
      <Route path="/staff-login" element={<StaffLogin />} />
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/staffpayments" element={<StaffPayments />} />
      <Route path="/create-payment" element={<CreatePayment />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
}