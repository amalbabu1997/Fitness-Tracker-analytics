import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Modal,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// PaymentComponent: Renders a form for payment details and posts the payment.
// It shows the subscription amount based on the selected subscription plan.
function PaymentComponent({
  subscriptionAmount,
  onPaymentSuccess,
  onPaymentFailure,
}) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [error, setError] = useState("");

  // Fetch available payment methods.
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/payment/methods/")
      .then((res) => setPaymentMethods(res.data))
      .catch((err) => console.error("Error fetching payment methods:", err));
  }, []);

  // Validate payment details based on the selected payment method.
  const validatePayment = () => {
    if (!selectedMethod) {
      return "Please select a payment method.";
    }
    const selected = paymentMethods.find(
      (m) => m.id === parseInt(selectedMethod, 10)
    );
    if (!selected) {
      return "Invalid payment method selected.";
    }
    if (selected.method_name === "Credit Card") {
      if (cardNumber.replace(/\s+/g, "").length !== 16) {
        return "Card number must be 16 digits.";
      }
      if (!expiry) {
        return "Expiry date is required.";
      }
      if (cvv.length !== 3) {
        return "CVV must be 3 digits.";
      }
    } else if (selected.method_name === "PayPal") {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!paypalEmail || !emailRegex.test(paypalEmail)) {
        return "Please enter a valid PayPal email address.";
      }
    } else if (selected.method_name === "Bank Transfer") {
      if (!bankAccount) {
        return "Please enter your bank account number.";
      }
    }
    return "";
  };

  // Submit the payment details.
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    // Build the payload using the dynamic subscriptionAmount.
    const payload = {
      payment_method: parseInt(selectedMethod, 10),
      amount: subscriptionAmount,
      currency: "USD",
      status: "completed", // For simulation, assume success.
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/payment/submit/",
        payload
      );
      if (response.data.status === "completed") {
        onPaymentSuccess(response.data);
      } else {
        setError("Payment failed. Please try again.");
        onPaymentFailure();
      }
    } catch (err) {
      setError("Payment error. Please try again.");
      onPaymentFailure();
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit}>
      <Typography variant="h6" gutterBottom>
        Enter Payment Details
      </Typography>
      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      <FormControl fullWidth margin="normal">
        <InputLabel id="payment-method-label">Payment Method</InputLabel>
        <Select
          labelId="payment-method-label"
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          label="Payment Method"
          required
        >
          <MenuItem value="">
            <em>Select a payment method</em>
          </MenuItem>
          {paymentMethods.map((method) => (
            <MenuItem key={method.id} value={String(method.id)}>
              {method.method_name}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {selectedMethod &&
            paymentMethods.find((m) => m.id === parseInt(selectedMethod, 10))
              ?.description}
        </FormHelperText>
      </FormControl>

      {/* Display the subscription amount */}
      <Typography variant="body1" marginY={2}>
        Payment Amount: ${subscriptionAmount}
      </Typography>

      {selectedMethod &&
        paymentMethods.find((m) => m.id === parseInt(selectedMethod, 10))
          ?.method_name === "Credit Card" && (
          <>
            <TextField
              label="Card Number"
              fullWidth
              margin="normal"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
            />
            <TextField
              label="Expiry Date (MM/YY)"
              fullWidth
              margin="normal"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
            />
            <TextField
              label="CVV"
              fullWidth
              margin="normal"
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
            />
          </>
        )}
      {selectedMethod &&
        paymentMethods.find((m) => m.id === parseInt(selectedMethod, 10))
          ?.method_name === "PayPal" && (
          <TextField
            label="PayPal Email"
            fullWidth
            margin="normal"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
        )}
      {selectedMethod &&
        paymentMethods.find((m) => m.id === parseInt(selectedMethod, 10))
          ?.method_name === "Bank Transfer" && (
          <TextField
            label="Bank Account Number"
            fullWidth
            margin="normal"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter your bank account number"
          />
        )}
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Confirm Payment
      </Button>
    </form>
  );
}

// Signup component: Renders the signup form, opens a payment modal, and submits signup data after payment.
export default function Signup() {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    gender: "Male",
    age: "",
    goal_description: "",
    subscription_plan: "",
    password: "",
  });
  const [plans, setPlans] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [genericError, setGenericError] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const navigate = useNavigate();

  // Fetch subscription plans from the backend.
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/subscriptions/subscription-plans/")
      .then((res) => setPlans(res.data))
      .catch((err) => console.error("Error fetching subscription plans:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open the payment modal on form submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGenericError(null);
    // Additional form validations can be added here.
    setOpenPaymentModal(true);
  };

  // Compute subscription amount based on the selected plan.
  const selectedPlan = plans.find(
    (plan) =>
      plan.subscription_plan_id === parseInt(formData.subscription_plan, 10)
  );
  const subscriptionAmount = selectedPlan ? selectedPlan.price : 0;

  // After successful payment, post the signup data including the payment method.
  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      const dataToSend = {
        ...formData,
        subscription_plan: parseInt(formData.subscription_plan, 10),
        age: parseInt(formData.age, 10),
        payment_method: paymentResponse.payment_method,
      };
      await axios.post("http://127.0.0.1:8000/api/signupbk/", dataToSend, {
        withCredentials: true,
      });
      alert("Signup and Payment successful!");
      setOpenPaymentModal(false);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        const { status, data, headers } = error.response;
        console.error("Signup error — HTTP", status);
        console.error("Response data:", data);
        console.error("Response headers:", headers);
        setFieldErrors(data);
        setGenericError(
          data.detail ?? "Signup failed. See field errors below."
        );
      } else {
        console.error("Unexpected error:", error);
        setGenericError(error.message);
      }
    }
  };

  const handlePaymentFailure = () => {
    alert("Payment failed. Please try again.");
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Sign Up
      </Typography>
      {genericError && (
        <Typography variant="body1" color="error" align="center">
          {genericError}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="first_name"
              label="First Name"
              fullWidth
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
              required
              error={!!fieldErrors.first_name}
              helperText={
                fieldErrors.first_name ? fieldErrors.first_name.join(", ") : ""
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="middle_name"
              label="Middle Name"
              fullWidth
              placeholder="Enter your middle name (optional)"
              value={formData.middle_name}
              onChange={handleChange}
              error={!!fieldErrors.middle_name}
              helperText={
                fieldErrors.middle_name
                  ? fieldErrors.middle_name.join(", ")
                  : ""
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="last_name"
              label="Last Name"
              fullWidth
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
              required
              error={!!fieldErrors.last_name}
              helperText={
                fieldErrors.last_name ? fieldErrors.last_name.join(", ") : ""
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email ? fieldErrors.email.join(", ") : ""}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="phone_number"
              label="Phone Number"
              fullWidth
              placeholder="Enter your phone number"
              inputProps={{ maxLength: 10 }}
              value={formData.phone_number}
              onChange={handleChange}
              required
              error={!!fieldErrors.phone_number}
              helperText={
                fieldErrors.phone_number
                  ? fieldErrors.phone_number.join(", ")
                  : ""
              }
            />
          </Grid>

          <Grid item xs={12}>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="Female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel
                value="Other"
                control={<Radio />}
                label="Other"
              />
            </RadioGroup>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="age"
              label="Age"
              type="number"
              fullWidth
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
              required
              error={!!fieldErrors.age}
              helperText={fieldErrors.age ? fieldErrors.age.join(", ") : ""}
            />
          </Grid>
          {/* set a Goal */}
          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={!!fieldErrors.goal_description}
            >
              <InputLabel id="goal-label">Goal</InputLabel>
              <Select
                name="goal_description"
                labelId="goal-label"
                value={formData.goal_description}
                onChange={handleChange}
                label="Goal"
              >
                <MenuItem value="">
                  <em>Select your goal</em>
                </MenuItem>
                <MenuItem value="Weight Loss">Weight Loss</MenuItem>
                <MenuItem value="Build Muscle">Build Muscle</MenuItem>
                <MenuItem value="Weight Gain">Weight Gain</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
              </Select>
              <FormHelperText>
                {fieldErrors.goal_description
                  ? fieldErrors.goal_description.join(", ")
                  : "Choose the fitness goal you want to achieve."}
              </FormHelperText>
            </FormControl>
          </Grid>
          {/* Subscription Plan */}
          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={!!fieldErrors.subscription_plan}
            >
              <InputLabel id="subscription-label">Subscription Plan</InputLabel>
              <Select
                name="subscription_plan"
                labelId="subscription-label"
                value={formData.subscription_plan}
                onChange={handleChange}
                label="Subscription Plan"
              >
                <MenuItem value="">
                  <em>Select a plan</em>
                </MenuItem>
                {plans.map((plan) => (
                  <MenuItem
                    key={plan.subscription_plan_id}
                    value={String(plan.subscription_plan_id)}
                  >
                    {`${plan.plan_name} - $${plan.price}`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {fieldErrors.subscription_plan
                  ? fieldErrors.subscription_plan.join(", ")
                  : "Choose the subscription plan that fits your needs."}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="username"
              label="Username"
              fullWidth
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username?.join(", ")}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              placeholder="Enter a secure password"
              value={formData.password}
              onChange={handleChange}
              required
              error={!!fieldErrors.password}
              helperText={
                fieldErrors.password ? fieldErrors.password.join(", ") : ""
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Sign Up
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Payment Modal */}
      <Modal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 1,
            boxShadow: 24,
          }}
        >
          <PaymentComponent
            subscriptionAmount={subscriptionAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
          />
        </Box>
      </Modal>
    </Container>
  );
}
