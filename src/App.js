import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SubjectManagement from "./pages/SubjectManagement";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import GoogleOAuth from "./components/Auth/GoogleOAuth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Explore from "./pages/Explore";
import ExploreExercises from "./pages/ExploreExercises";
import ExploreExerciseDetail from "./pages/ExploreExerciseDetail";
import MyCourses from "./pages/MyCourses";
import AdminSubmissions from "./pages/AdminSubmissions";
import TopicPage from "./pages/TopicPage";
import { LoginProvider } from "./loginContext/LoginContextFile";

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <LoginProvider>
        <Router>
          <Navbar />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/my-courses" component={MyCourses} />
            <Route path="/subjects/manage" component={SubjectManagement} />
            <Route path="/login" component={Login} />
            <Route path="/auth/register" component={Register} />
            <Route path="/google-oauth" component={GoogleOAuth} />
            {/* Single Explore page for all browsing */}
            <Route path="/explore/subject/:subjectId" component={Explore} />
            <Route path="/explore" exact component={Explore} />
            <Route path="/explore/topic/:topicId" component={TopicPage} />
            <Route
              path="/explore/exercise/:exerciseId"
              component={ExploreExerciseDetail}
            />
            <Route path="/admin/submissions" component={AdminSubmissions} />
          </Switch>
        </Router>
      </LoginProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
