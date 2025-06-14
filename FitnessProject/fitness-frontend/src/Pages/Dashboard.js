import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
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
  // --- State ---

  const [firstName, setFirstName] = useState("");
  const [goal, setGoal] = useState("");
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
  // const [items, setItems] = useState([]);
  const [sizes, setSizes] = useState([]);
  // const [selectedCat, setSelectedCat] = useState("");
  // const [selectedItem, setSelectedItem] = useState("");
  // const [selectedSize, setSelectedSize] = useState("");
  // const [quantity, setQuantity] = useState("");
  const [entries, setEntries] = useState([
    { category: "", food_item: "", size: "", quantity: "" },
  ]);
  const [consumptionFilterMeal, setConsumptionFilterMeal] = useState("");
  const [consumptionData, setConsumptionData] = useState([]);

  const [itemsByCat, setItemsByCat] = useState({});

  const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];
  const theme = useTheme();

  // --- Load profile & meal prompt ---
  useEffect(() => {
    // fetch profile
    axios
      .get("http://localhost:8000/api/profile/", { withCredentials: true })
      .then((res) => {
        setFirstName(res.data.first_name || res.data.username);
        setGoal(res.data.goal_description);
      });

    // derive both prompt and type
    const hour = new Date().getHours();
    const type = hour < 12 ? "breakfast" : hour < 17 ? "lunch" : "dinner";

    setMealType(type); // e.g. "breakfast", "lunch", or "dinner"

    // capitalise and append label exactly as before
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    setMealPrompt(`${label} Calorie Check`);
  }, []);

  // --- Load exercises on goal change ---
  useEffect(() => {
    if (!goal) return;
    axios
      .get(`http://localhost:8000/api/exercises/?goal_category=${goal}`, {
        withCredentials: true,
      })
      .then((res) => setExercises(res.data));
  }, [goal]);

  // --- Fetch functions ---
  const fetchTodayActivities = useCallback(() => {
    axios
      .get("http://localhost:8000/api/exercise-analytics/today/", {
        withCredentials: true,
      })
      .then((res) => setDailyActivity(res.data));
  }, []);

  const fetchAnalyticsProgress = useCallback(() => {
    axios
      .get(
        `http://localhost:8000/api/analytics/progress-summary/?type=${taskFilter}`,
        { withCredentials: true }
      )
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
      .get(`http://localhost:8000/api/achievement-summary/?type=${type}`, {
        withCredentials: true,
      })
      .then((res) => setAchievementData(res.data));
  }, []);

  const fetchBurnData = useCallback((type, start, end) => {
    const params = { type: type.toLowerCase() };
    if (start) params.start = start;
    if (end) params.end = end;

    axios
      .get("http://localhost:8000/api/burn-summary/", {
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
      .get("http://localhost:8000/api/health/daily-checkin/", {
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
      axios.get("http://localhost:8000/api/foodcategories/", {
        withCredentials: true,
      }),
      axios.get("http://localhost:8000/api/sizes/", { withCredentials: true }),
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
      .get("http://localhost:8000/api/fooditems/", {
        params: { category: catId },
        withCredentials: true,
      })
      .then((r) => setItemsByCat((prev) => ({ ...prev, [catId]: r.data })))
      .catch(console.error);
  };

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
        "http://localhost:8000/api/meal/log/",
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
        "http://localhost:8000/api/occurrences/create-or-update/",
        { analytics_id: id, date: today, status },
        { withCredentials: true }
      )
      .then(fetchTodayActivities);
  };

  const handleCreateChallenge = () => {
    if (!selectedExercise || !durationType || !occurrenceCount) return;
    axios
      .post(
        "http://localhost:8000/api/exercise-analytics/create/",
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
      .get("http://localhost:8000/api/consumption-summary/", {
        params,
        withCredentials: true,
      })
      .then((res) => setConsumptionData(res.data))
      .catch(console.error);
  }, [startDate, endDate, consumptionFilterMeal]);

  const handleHealthSubmit = () => {
    axios
      .post(
        "http://localhost:8000/api/health-checkup/",
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
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <AccountCircle />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {firstName}'s Dashboard
          </Typography>
          <Button color="inherit" onClick={() => setChallengeOpen(true)}>
            Add New Analytics Record
          </Button>
          <Button color="inherit" onClick={() => setHealthcheckOpen(true)}>
            Daily Health Checkup
          </Button>
          <Button color="inherit" onClick={() => setFoodModalOpen(true)}>
            {mealPrompt}
          </Button>
        </Toolbar>
      </AppBar>

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
                    outerRadius={80}
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
                    outerRadius={80}
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Analytics Type</InputLabel>
            <Select
              value={durationType}
              label="Analytics Type"
              onChange={(e) => setDurationType(e.target.value)}
            >
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Exercise</InputLabel>
            <Select
              value={selectedExercise}
              label="Exercise"
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              {exercises.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>
                  {ex.exercise_name} ({ex.calories_burned} cal)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
