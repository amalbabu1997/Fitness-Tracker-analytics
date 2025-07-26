import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "@mui/material";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Modal,
  TextField,
  Container,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const groupSleepData = (data, viewType) => {
  const grouped = {};

  data.forEach((entry) => {
    const date = dayjs(entry.date);
    const key =
      viewType === "Weekly"
        ? `${date.year()}-W${date.isoWeek()}`
        : viewType === "Monthly"
        ? `${date.year()}-${date.format("MM")}`
        : date.format("YYYY-MM-DD");

    if (!grouped[key]) {
      grouped[key] = { total_sleep: 0, count: 0 };
    }

    grouped[key].total_sleep += entry.sleep_hours;
    grouped[key].count += 1;
  });

  return Object.entries(grouped).map(([key, val]) => ({
    date: key,
    total_sleep: parseFloat((val.total_sleep / val.count).toFixed(2)),
  }));
};

export default function Dashboard() {
  const navigate = useNavigate();
  // --- State ---

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [goal, setGoal] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = useMemo(() => {
    if (!firstName || !lastName) return "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, [firstName, lastName]);

  const handleProfileOpen = () => setProfileOpen(true);
  const handleProfileClose = () => setProfileOpen(false);
  const [mealPrompt, setMealPrompt] = useState("");
  const [durationType, setDurationType] = useState("Daily");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [dailyActivity, setDailyActivity] = useState([]);
  const [occurrenceCount, setOccurrenceCount] = useState(1);
  const [taskFilter, setTaskFilter] = useState("Daily");
  const [achievementFilter, setAchievementFilter] = useState("Daily");
  const [achievementData, setAchievementData] = useState([]);
  const [burnData, setBurnData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [healthcheckOpen, setHealthcheckOpen] = useState(false);
  const [heartRate, setHeartRate] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [weight, setWeight] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [mood, setMood] = useState("");
  const [stress, setStress] = useState("");
  const [steps, setSteps] = useState("");
  const [exercises, setExercises] = useState([]);
  const [progressSummary, setProgressSummary] = useState([]);
  const [healthStart, setHealthStart] = useState("");
  const [healthEnd, setHealthEnd] = useState("");
  const [healthData, setHealthData] = useState([]);
  const [healthMetric, setHealthMetric] = useState("heart_rate");
  const metricLabels = {
    heart_rate: "Heart Rate",
    systolic_bp: "Systolic BP",
    diastolic_bp: "Diastolic BP",
  };
  const [mealType, setMealType] = useState("");
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [entries, setEntries] = useState([
    { category: "", food_item: "", size: "", quantity: "" },
  ]);
  const [consumptionFilterMeal, setConsumptionFilterMeal] = useState("");
  const [consumptionData, setConsumptionData] = useState([]);

  const [itemsByCat, setItemsByCat] = useState({});

  const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];
  const theme = useTheme();

  const [editOpen, setEditOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [goalOpen, setGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(goal || "");
  const [subOpen, setSubOpen] = useState(false);
  const [newPlan, setNewPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  //const [subscriptionPlan, setSubscriptionPlan] = useState("");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const handleChangePassword = () => setPasswordOpen(true);

  // --- Load profile & meal prompt ---
  useEffect(() => {
    // fetch profile
    axios
      .get("/api/profile/", { withCredentials: true })
      .then((res) => {
        console.log("Profile payload:", res.data);
        setFirstName(res.data.first_name || res.data.username);
        setLastName(res.data.last_name || "");
        setGoal(res.data.goal_description ?? res.data.goal ?? "");
      })
      .catch(console.error);

    // derive both prompt and type
    const hour = new Date().getHours();
    const type = hour < 12 ? "breakfast" : hour < 17 ? "lunch" : "dinner";
    setMealType(type);

    // capitalise and append label exactly as before
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    setMealPrompt(`${label} Calorie Check`);
  }, []); // ← this closes *this* useEffect

  const loadExercises = useCallback(() => {
    if (!goal) return;
    console.log(" loading exercises for goal:", goal);
    axios
      .get(`/api/exercises/?goal_category=${encodeURIComponent(goal)}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(" exercises payload:", res.data);
        setExercises(res.data);
      })
      .catch((err) =>
        console.error(" failed to load exercises for goal", goal, err)
      );
  }, [goal]);

  useEffect(() => {
    if (challengeOpen && goal) {
      loadExercises();
    }
  }, [challengeOpen, goal, loadExercises]);

  // --- Fetch functions ---
  const fetchTodayActivities = useCallback(() => {
    axios
      .get("/api/exercise-analytics/today/", {
        withCredentials: true,
      })
      .then((res) => setDailyActivity(res.data));
  }, []);

  const fetchAnalyticsProgress = useCallback(() => {
    axios
      .get(`/api/analytics/progress-summary/?type=${taskFilter}`, {
        withCredentials: true,
      })
      .then((res) => {
        const summary = res.data.reduce(
          (acc, item) => {
            acc.Completed += item.completed;
            acc.Skipped += item.skipped;
            acc.Uncompleted += item.uncompleted;
            return acc;
          },
          { Completed: 0, Skipped: 0, Uncompleted: 0 }
        );

        setProgressSummary([
          { name: "Completed", value: summary.Completed },
          { name: "Skipped", value: summary.Skipped },
          { name: "Uncompleted", value: summary.Uncompleted },
        ]);
      });
  }, [taskFilter]);

  const fetchAchievementData = useCallback((type) => {
    axios
      .get(`/api/achievement-summary/?type=${type}`, {
        withCredentials: true,
      })
      .then((res) => setAchievementData(res.data));
  }, []);

  const fetchBurnData = useCallback((type, start, end) => {
    const params = { type: type.toLowerCase() };
    if (start) params.start = start;
    if (end) params.end = end;

    axios
      .get("/api/burn-summary/", {
        params,
        withCredentials: true,
      })
      .then((res) =>
        setBurnData(
          res.data.map((d) => ({
            date: d.date,
            total_calories: d.total_calories,
          }))
        )
      );
  }, []);

  const fetchHealthData = useCallback(() => {
    const params = {};
    if (healthStart) params.start = healthStart;
    if (healthEnd) params.end = healthEnd;

    axios
      .get("/api/health/daily-checkin/", {
        params,
        withCredentials: true,
      })
      .then((res) => setHealthData(res.data))
      .catch((err) => console.error("Health fetch failed:", err));
  }, [healthStart, healthEnd]);

  // --- Set default health date range (last 30 days) ---
  useEffect(() => {
    if (!healthStart && !healthEnd) {
      const today = dayjs().format("YYYY-MM-DD");
      const thirtyDaysAgo = dayjs().subtract(30, "day").format("YYYY-MM-DD");
      setHealthEnd(today);
      setHealthStart(thirtyDaysAgo);
    }
  }, [healthStart, healthEnd]);

  // --- Set default sleep/calorie date range (last 30 days) ---
  useEffect(() => {
    if (!startDate && !endDate) {
      const today = dayjs().format("YYYY-MM-DD");
      const thirtyDaysAgo = dayjs().subtract(30, "day").format("YYYY-MM-DD");
      setEndDate(today);
      setStartDate(thirtyDaysAgo);
    }
  }, [startDate, endDate]);

  const sleepGraphData = useMemo(() => {
    if (!healthData || !Array.isArray(healthData)) return [];

    const filtered = healthData.filter((entry) => {
      const entryDate = dayjs(entry.date);
      const from = dayjs(startDate);
      const to = dayjs(endDate);
      return (
        (!startDate || (from.isValid() && entryDate.isSameOrAfter(from))) &&
        (!endDate || (to.isValid() && entryDate.isSameOrBefore(to)))
      );
    });

    return groupSleepData(filtered, durationType);
  }, [healthData, startDate, endDate, durationType]);

  useEffect(() => {
    if (!foodModalOpen) return;
    Promise.all([
      axios.get("/api/foodcategories/", {
        withCredentials: true,
      }),
      axios.get("/api/sizes/", { withCredentials: true }),
    ])
      .then(([c, s]) => {
        setCategories(c.data);
        setSizes(s.data);
      })
      .catch(console.error);
  }, [foodModalOpen]);

  // --- Helpers for entries rows ---
  const addEntryRow = () =>
    setEntries((e) => [
      ...e,
      { category: "", food_item: "", size: "", quantity: "" },
    ]);
  const removeEntryRow = (i) => setEntries((e) => e.filter((_, j) => j !== i));

  const fetchItemsForCat = (catId) => {
    if (!catId || itemsByCat[catId]) return;
    axios
      .get("/api/fooditems/", {
        params: { category: catId },
        withCredentials: true,
      })
      .then((r) => setItemsByCat((prev) => ({ ...prev, [catId]: r.data })))
      .catch(console.error);
  };

  useEffect(() => {
    axios
      .get("/api/subscriptions/subscription-plans/", {
        withCredentials: true,
      })
      .then((res) => setPlans(res.data))
      .catch((err) => console.error("Failed to load subscription plans:", err));
  }, []);
  const updateEntry = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const updated = { ...row, [field]: value };
        if (field === "category") {
          updated.food_item = "";
          updated.size = "";
          updated.quantity = "";
          fetchItemsForCat(value);
        }
        if (field === "food_item") {
          updated.size = "";
          updated.quantity = "";
        }
        if (field === "size") {
          updated.quantity = "";
        }
        return updated;
      })
    );
  };

  const handleFoodSave = () => {
    // build an array of promises
    const saves = entries.map((r) =>
      axios.post(
        "/api/meal/log/",
        {
          meal_type: mealType,
          category: r.category,
          food_item: r.food_item,
          size: r.size,
          quantity: parseFloat(r.quantity),
        },
        { withCredentials: true }
      )
    );

    // wait for them all
    Promise.all(saves)
      .then(() => {
        alert("Meal logged!");
        setFoodModalOpen(false);
        setEntries([{ category: "", food_item: "", size: "", quantity: "" }]);
      })
      .catch((err) => {
        console.error("Food log error:", err.response || err);
        alert("Failed to log all items. See console for details.");
      });
  };
  // --- Refresh on filter change ---
  useEffect(() => {
    fetchTodayActivities();
    fetchAchievementData(achievementFilter);
    fetchBurnData(durationType, startDate, endDate);
    fetchAnalyticsProgress();
    fetchHealthData();
  }, [
    achievementFilter,
    durationType,
    startDate,
    endDate,
    healthStart,
    healthEnd,
    fetchTodayActivities,
    fetchAchievementData,
    fetchBurnData,
    fetchAnalyticsProgress,
    fetchHealthData,
  ]);

  // --- Handlers ---
  const handleOccurrenceAction = (id, status) => {
    const today = new Date().toISOString().slice(0, 10);
    axios
      .post(
        "/api/occurrences/create-or-update/",
        { analytics_id: id, date: today, status },
        { withCredentials: true }
      )
      .then(fetchTodayActivities);
  };

  const handleCreateChallenge = () => {
    if (!selectedExercise || !durationType || !occurrenceCount) return;
    axios
      .post(
        "/api/exercise-analytics/create/",
        {
          exercise: selectedExercise,
          exercise_type: durationType,
          occurrence_count: occurrenceCount,
        },
        { withCredentials: true }
      )
      .then(() => {
        alert("Analytics recorded!");
        setChallengeOpen(false);
        setSelectedExercise("");
        setDurationType("Daily");
        setOccurrenceCount(1);
        fetchTodayActivities();
      });
  };

  useEffect(() => {
    const params = {
      start: startDate,
      end: endDate,
    };
    if (consumptionFilterMeal) {
      params.meal_type = consumptionFilterMeal;
    }

    axios
      .get("/api/consumption-summary/", {
        params,
        withCredentials: true,
      })
      .then((res) => setConsumptionData(res.data))
      .catch(console.error);
  }, [startDate, endDate, consumptionFilterMeal]);

  const handleHealthSubmit = () => {
    axios
      .post(
        "/api/health-checkup/",
        {
          source: "manual",
          heart_rate: heartRate || null,
          systolic_bp: systolicBP || null,
          diastolic_bp: diastolicBP || null,
          weight: weight || null,
          sleep_hours: sleepHours || null,
          water_intake: waterIntake || null,
          mood: mood || null,
          stress: stress || null,
          steps: steps || null,
        },
        { withCredentials: true }
      )
      .then(() => {
        alert("Check-in saved");
        setHealthcheckOpen(false);
        setHeartRate("");
        setSystolicBP("");
        setDiastolicBP("");
        setWeight("");
        setSleepHours("");
        setWaterIntake("");
        setMood("");
        setStress("");
        setSteps("");
      })
      .catch(() => alert("Save failed"));
  };

  // Settings menu handlers
  const handleEditProfile = () => {
    // preload existing profile
    axios
      .get("/api/profile/", { withCredentials: true })
      .then((res) => setProfileData(res.data))
      .then(() => setEditOpen(true))
      .catch(console.error);
  };
  const handleChangeGoal = () => {
    setNewGoal(goal);
    setGoalOpen(true);
  };
  const handleChangeSubscription = () => setSubOpen(true);
  const saveGoal = () => {
    axios
      .patch(
        "/api/profile/goal/", // ← must include "goal/"
        { goal_description: newGoal },
        { withCredentials: true }
      )
      .then(() => {
        setGoal(newGoal);
        setGoalOpen(false);
      })
      .catch(() => alert("Failed to update goal."));
  };

  const saveSubscription = () => {
    axios
      .patch(
        "/api/subscriptions/user-subscription/",
        { subscription_plan: newPlan },
        { withCredentials: true }
      )
      .then(() => {
        setSubOpen(false);
        // Optionally show a success message or refresh user data
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update subscription.");
      });
  };
  const openChallengeModal = () => {
    setChallengeOpen(true);
  };

  const handleLogout = () => {
    axios
      .post("/api/logout/", {}, { withCredentials: true })
      .then(() => {
        localStorage.clear();
        sessionStorage.clear();

        // 2) Reset your in-memory state by either:
        //    a) navigating to /login with replace + doing a hard reload, or
        //    b) manually clearing each slice of state you care about
        //
        // Here’s the quick-and-dirty way:
        navigate("/login", { replace: true });
        window.location.reload();
      })
      .catch((err) => {
        console.error("Logout failed:", err);
        alert("Could not log out. Try again.");
      });
  };

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: "100vh",
        color: theme.palette.primary.contrastText,
      }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {firstName.charAt(0).toUpperCase() + firstName.slice(1)}'s Dashboard
          </Typography>
          <Button sx={{ ml: 2 }} color="inherit" onClick={openChallengeModal}>
            Add New Analytics Record
          </Button>
          <Button
            sx={{ ml: 2 }}
            color="inherit"
            onClick={() => setHealthcheckOpen(true)}
          >
            Daily Health Checkup
          </Button>
          <Button
            sx={{ ml: 2 }}
            color="inherit"
            onClick={() => setFoodModalOpen(true)}
          >
            {mealPrompt}
          </Button>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleProfileOpen}
            sx={{ ml: 2, mr: 2 }}
          >
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {initials}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Dialog open={profileOpen} onClose={handleProfileClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            <ListItemButton onClick={handleEditProfile}>
              <ListItemText primary="Edit your personal information" />
            </ListItemButton>
            <Divider />

            <ListItemButton onClick={handleChangePassword}>
              <ListItemText primary="Change your password" />
            </ListItemButton>
            <Divider />

            <ListItemButton onClick={handleChangeGoal}>
              <ListItemText primary="Change your goal" />
            </ListItemButton>
            <Divider />

            <ListItemButton onClick={handleChangeSubscription}>
              <ListItemText primary="Change your subscription plan" />
            </ListItemButton>
            <Divider />

            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Log out" />
            </ListItemButton>
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "grid", gap: 2, width: 400 }}>
            {[
              { name: "first_name", label: "First Name" },
              { name: "middle_name", label: "Middle Name" },
              { name: "last_name", label: "Last Name" },
              { name: "email", label: "Email", type: "email" },
              { name: "phone_number", label: "Phone Number" },
            ].map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type || "text"}
                fullWidth
                value={profileData[field.name] || ""}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    [field.name]: e.target.value,
                  }))
                }
              />
            ))}
            <Button
              variant="contained"
              onClick={() => {
                axios
                  .patch("/api/profile/", profileData, {
                    withCredentials: true,
                  })
                  .then(() => {
                    setEditOpen(false);
                    // optionally refresh other parts of the UI
                  })
                  .catch((err) => {
                    console.error(err);
                    alert("Failed to update profile.");
                  });
              }}
            >
              Save Changes
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={goalOpen} onClose={() => setGoalOpen(false)} fullWidth>
        <DialogTitle>Change Your Goal</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel id="goal-select-label">Goal</InputLabel>
            <Select
              labelId="goal-select-label"
              value={newGoal}
              label="Goal"
              onChange={(e) => setNewGoal(e.target.value)}
            >
              <MenuItem value="">
                <em>Select your goal</em>
              </MenuItem>
              <MenuItem value="Weight Loss">Weight Loss</MenuItem>
              <MenuItem value="Build Muscle">Build Muscle</MenuItem>
              <MenuItem value="Weight Gain">Weight Gain</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveGoal} disabled={!newGoal}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* — Subscription Dialog — */}
      <Dialog open={subOpen} onClose={() => setSubOpen(false)} fullWidth>
        <DialogTitle>Change Your Subscription Plan</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <InputLabel>Plan</InputLabel>
            <Select
              value={newPlan}
              label="Plan"
              onChange={(e) => setNewPlan(e.target.value)}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.plan_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveSubscription}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "grid", gap: 2, width: 360 }}>
            {[
              { name: "old_password", label: "Old Password" },
              { name: "new_password", label: "New Password" },
              { name: "confirm_password", label: "Confirm New Password" },
            ].map(({ name, label }) => (
              <TextField
                key={name}
                name={name}
                label={label}
                type="password"
                fullWidth
                value={passwordData[name]}
                onChange={(e) =>
                  setPasswordData((p) => ({ ...p, [name]: e.target.value }))
                }
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={
              !passwordData.old_password ||
              !passwordData.new_password ||
              passwordData.new_password !== passwordData.confirm_password
            }
            onClick={async () => {
              try {
                const res = await axios.post(
                  "/api/change-password/",
                  passwordData,
                  { withCredentials: true }
                );
                alert(res.data.detail);
                setPasswordOpen(false);
              } catch (err) {
                alert(err.response?.data?.detail || "Error changing password");
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Today's Analytics Cards */}
        <Typography variant="h5" gutterBottom>
          Today's Analytics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {dailyActivity.length ? (
            dailyActivity.map((activity) => (
              <Grid item xs={12} sm={6} md={4} key={activity.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {activity.exercise.exercise_name}
                    </Typography>
                    <Typography variant="body2">
                      Type: {activity.exercise_type}
                    </Typography>
                    <Typography variant="body2">
                      Progress: {activity.progress_percent}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ mr: 1 }}
                        onClick={() =>
                          handleOccurrenceAction(activity.id, "completed")
                        }
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() =>
                          handleOccurrenceAction(activity.id, "skipped")
                        }
                      >
                        Skip
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}
              >
                No daily analytics records found.
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={4}>
          {/* Task Completion Donut */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Task Completion Summary
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Filter</InputLabel>
              <Select
                value={taskFilter}
                label="Filter"
                onChange={(e) => setTaskFilter(e.target.value)}
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <Card>
              <CardContent>
                <PieChart width={300} height={250}>
                  <Pie
                    data={progressSummary}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={theme.charts.pieInnerRadius}
                    outerRadius={theme.charts.pieOuterRadius}
                    label
                  >
                    {progressSummary.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </CardContent>
            </Card>
          </Grid>

          {/* Achievement Donut */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Achievement Summary
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Filter</InputLabel>
              <Select
                value={achievementFilter}
                label="Filter"
                onChange={(e) => setAchievementFilter(e.target.value)}
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <Card>
              <CardContent>
                <PieChart width={300} height={250}>
                  <Pie
                    data={achievementData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={theme.charts.pieInnerRadius}
                    outerRadius={theme.charts.pieOuterRadius}
                    label
                  >
                    {achievementData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </CardContent>
            </Card>
          </Grid>

          {/* Calorie Burn Bar (full width) */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Calorie Burn Chart
            </Typography>
            <Grid
              container
              justifyContent="space-between"
              sx={{ mt: 2, mb: 2 }}
            >
              <Grid item xs={5}>
                <TextField
                  label="From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal">
              <InputLabel>Burn View</InputLabel>
              <Select
                value={durationType}
                label="Burn View"
                onChange={(e) => setDurationType(e.target.value)}
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={burnData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      interval={0}
                      textAnchor="end"
                      angle={0}
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(val) => `${val} cal`} />
                    <Bar
                      dataKey="total_calories"
                      name="Calories Burned"
                      fill={COLORS[0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Health Data Filter & Chart */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Medical Health Data
            </Typography>

            <Grid
              container
              justifyContent="space-between"
              sx={{ mt: 2, mb: 2 }}
            >
              <Grid item xs={5}>
                <TextField
                  label="From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={healthStart}
                  onChange={(e) => setHealthStart(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={5}>
                <TextField
                  label="To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={healthEnd}
                  onChange={(e) => setHealthEnd(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal">
              <InputLabel id="metric-select-label">Metric</InputLabel>
              <Select
                labelId="metric-select-label"
                value={healthMetric}
                label="Metric"
                onChange={(e) => setHealthMetric(e.target.value)}
              >
                <MenuItem value="heart_rate">Heart Rate</MenuItem>
                <MenuItem value="systolic_bp">Systolic BP</MenuItem>
                <MenuItem value="diastolic_bp">Diastolic BP</MenuItem>
              </Select>
            </FormControl>
            <Grid item xs={6}>
              <Button
                variant="contained"
                onClick={fetchHealthData}
                sx={{ mb: 2 }}
              >
                Load Health Data
              </Button>
            </Grid>
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={healthData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={healthMetric}
                      name={metricLabels[healthMetric]}
                      stroke={COLORS[0]}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Sleep Hour Monitoring
            </Typography>

            <Grid
              container
              justifyContent="space-between"
              sx={{ mt: 2, mb: 2 }}
            >
              <Grid item xs={5}>
                <TextField
                  label="From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal">
              <InputLabel>View By</InputLabel>
              <Select
                value={durationType}
                label="Sleep View"
                onChange={(e) => setDurationType(e.target.value)}
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={sleepGraphData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      interval={0}
                      textAnchor="end"
                      angle={-15}
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(val) => `${val} hrs`} />
                    <Bar
                      dataKey="total_sleep"
                      name="Sleep By Hours"
                      fill="#00C49F"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Calorie Consumption
          </Typography>

          {/* date + meal-type filters */}
          <Grid container justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
            <Grid item xs={4}>
              <TextField
                label="From"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="To"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={consumptionFilterMeal}
                  label="Meal Type"
                  onChange={(e) => setConsumptionFilterMeal(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="breakfast">Breakfast</MenuItem>
                  <MenuItem value="lunch">Lunch</MenuItem>
                  <MenuItem value="dinner">Dinner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={consumptionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    interval={0}
                    textAnchor="end"
                    angle={-15}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip formatter={(val) => `${val} cal`} />
                  <Bar
                    dataKey="total_calories"
                    name="Calories Consumed"
                    fill={COLORS[1]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Container>

      {/* Analytics Modal */}
      <Modal open={challengeOpen} onClose={() => setChallengeOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Record New Analytics
          </Typography>

          {/* ── DEBUG: show goal + fetched exercises count ── */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: "italic" }}
          >
            Debug → goal: “{goal}”, exercises.length: {exercises.length}
          </Typography>

          {/* Analytics Type */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="analytics-type-label">Analytics Type</InputLabel>
            <Select
              labelId="analytics-type-label"
              id="analytics-type-select"
              value={durationType}
              label="Analytics Type"
              onChange={(e) => setDurationType(e.target.value)}
            >
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          {/* Exercise Picker */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="exercise-select-label">Exercise</InputLabel>
            <Select
              labelId="exercise-select-label"
              id="exercise-select"
              value={selectedExercise}
              label="Exercise"
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              {/* default empty choice */}
              <MenuItem value="">
                <em>Select an exercise</em>
              </MenuItem>

              {exercises.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>
                  {ex.exercise_name} ({ex.calories_burned} cal)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Repeat Count */}
          <TextField
            label="Repeat For (Times)"
            type="number"
            inputProps={{ min: 1 }}
            fullWidth
            margin="normal"
            value={occurrenceCount}
            onChange={(e) =>
              setOccurrenceCount(Math.max(1, parseInt(e.target.value, 10)))
            }
          />

          {/* Save Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleCreateChallenge}
          >
            Save Challenge
          </Button>
        </Box>
      </Modal>

      {/* Health-check Modal */}
      <Modal open={healthcheckOpen} onClose={() => setHealthcheckOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Today's Health Checkup
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Heart Rate"
                type="number"
                fullWidth
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Weight (kg)"
                type="number"
                fullWidth
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Systolic BP"
                type="number"
                fullWidth
                value={systolicBP}
                onChange={(e) => setSystolicBP(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Diastolic BP"
                type="number"
                fullWidth
                value={diastolicBP}
                onChange={(e) => setDiastolicBP(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Sleep Hours"
                type="number"
                fullWidth
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Water Intake (L)"
                type="number"
                fullWidth
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Mood (1–10)"
                type="number"
                fullWidth
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Stress (1–10)"
                type="number"
                fullWidth
                value={stress}
                onChange={(e) => setStress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Steps"
                type="number"
                fullWidth
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleHealthSubmit}
              >
                Save Check-In
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <Modal open={foodModalOpen} onClose={() => setFoodModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: 400,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Log Food Intake
          </Typography>

          {entries.map((row, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 3,
                borderBottom: idx < entries.length - 1 ? 1 : 0,
                borderColor: "divider",
                pb: 2,
              }}
            >
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={row.category}
                  label="Category"
                  onChange={(e) => updateEntry(idx, "category", e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                size="small"
                disabled={!row.category}
              >
                <InputLabel>Food Item</InputLabel>
                <Select
                  value={row.food_item}
                  label="Food Item"
                  onChange={(e) =>
                    updateEntry(idx, "food_item", e.target.value)
                  }
                >
                  {(itemsByCat[row.category] || []).map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <FormControl fullWidth size="small" disabled={!row.food_item}>
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={row.size}
                      label="Size"
                      onChange={(e) => updateEntry(idx, "size", e.target.value)}
                    >
                      {sizes.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Quantity"
                    type="number"
                    size="small"
                    fullWidth
                    disabled={!row.size}
                    value={row.quantity}
                    onChange={(e) =>
                      updateEntry(idx, "quantity", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button
                    size="small"
                    color="error"
                    disabled={entries.length === 1}
                    onClick={() => removeEntryRow(idx)}
                  >
                    ×
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button size="small" onClick={addEntryRow} sx={{ mb: 2 }}>
            + Add Another Item
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handleFoodSave}
            disabled={entries.some((r) => !r.food_item || !r.quantity)}
          >
            Save All
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
