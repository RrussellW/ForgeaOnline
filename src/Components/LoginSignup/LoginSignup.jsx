import React, { useState } from 'react';
import './LoginSignup.css';
import { Paper, TextField, Button, Typography, CircularProgress, Tooltip, Grid2, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

const LoginSignup = () => {
    const [disabled, setDisabled] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate Student ID
        if (!formData.studentId) {
            newErrors.studentId = 'Student ID is required';
        } else if (!/^\d{2}-\d{4}-\d{3}$/.test(formData.studentId)) {
            newErrors.studentId = 'Invalid Student ID format (e.g., 21-1476-291)';
        }

        // Validate Password
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        // Validate Confirm Password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setDisabled(true);
                
                // Check if student ID is already linked to an account
                const q = query(collection(db, "Dataset"), where("id", "==", formData.studentId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setErrors({ studentId: 'ID Number is already linked to an account' });
                    setDisabled(false);
                    return;
                }
    
                // Create the user in Firebase Authentication
                await createUserWithEmailAndPassword(auth, formData.studentId + "@forgea.com", formData.password);
    
                // Add user data to Firestore
                const data = {
                    id: formData.studentId,
                    personalitySummary: 'None',
                    major: 'None'
                };
                await setDoc(doc(db, "Dataset", data.id), data);
    
                // Reset form and navigate
                setDisabled(false);
                setFormData({ studentId: '', password: '', confirmPassword: '' });
                alert('Registration successful!');
                navigate('/');
            } catch (error) {
                if (error.code === 'auth/weak-password') {
                    setErrors({ password: 'Weak password. Password should be at least 6 characters' });
                }
                setDisabled(false);
            }
        }
    };

    return (
        
            <div className="LoginSignup">
                <Grid2 container spacing={0} direction="row" className="MainGridContainer" columnGap={0}>
                    <ThemeProvider theme={darkTheme}>
                    <CssBaseline />
                    <Grid2 className="GridSignin">
                        <Paper elevation={24} className="paperContainerLeft" >
                        <Typography variant="h5" className="typographyHeader" color='white' marginTop={7}>
                            <strong>Welcome to Forgea</strong>
                        </Typography>
                        
                        <Divider color='light.primary'>
                            <Typography variant="body2" color='white'>
                                Already have an Account?
                            </Typography>
                        </Divider>

                        <p/>
                        <div className='signUp' marginTop={10}>
                            <Button variant='outlined' color='white' onClick={() => navigate('/')} className="buttonRedirect">
                                Sign In
                            </Button>
                        </div></Paper>
                                            
                    </Grid2>
                    </ThemeProvider>
                    <Grid2>
                        <ThemeProvider theme={darkTheme}>
                        <CssBaseline />
                        <Paper elevation={24} className="paperContainerRight">
                            <Typography variant="h6" className="typographyHeader">
                                <strong className='strongPurple'>Create</strong> an Account
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <div className="inputField">
                                    <Tooltip title="Example Student ID: 11-1111-111" arrow>
                                    <TextField
                                        variant="filled"
                                        label="Student ID"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        fullWidth
                                        error={!!errors.studentId}
                                        helperText={errors.studentId}
                                        className="textFieldRoot"
                                    />
                                    </Tooltip>
                                </div>
                                <div className="inputField">
                                    <TextField
                                        variant="filled"
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        fullWidth
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        className="textFieldRoot"
                                    />
                                </div>
                                <div className="inputField">
                                    <TextField
                                        variant="filled"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        fullWidth
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                        className="textFieldRoot"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className="button"
                                    disabled={disabled}
                                >
                                    {!disabled ? 'Sign Up' : <CircularProgress color="inherit" size="30px" />}
                                </Button>
                            </form>
                        </Paper>
                        </ThemeProvider>
                    </Grid2>
                </Grid2>
                
            </div>
    );
};

export default LoginSignup;
