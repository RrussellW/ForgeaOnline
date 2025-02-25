// Import React and necessary hooks
import React, { useState } from 'react';
import './LoginSignin.css';
import { Paper, TextField, Button, Typography, CircularProgress, Grid2, Tooltip } from '@mui/material';
import createCache from '@emotion/cache';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs  } from "firebase/firestore";
import { db } from '../../firebase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

const LoginSignin = () => {
    const [disabled, setDisabled] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [firebaseError, setFirebaseError] = useState(null);
    const navigate = useNavigate(); // For redirecting on successful login

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate Email
        if (!formData.email) {
            newErrors.email = 'Email is required';
            setDisabled(false);
        } else if (!/^[\w-.]+@[\w-]+\.[a-z]{2,4}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email format';
            setDisabled(false);
        }

        // Validate Password
        if (!formData.password) {
            newErrors.password = 'Password is required';
            setDisabled(false);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFirebaseError(null);
        setDisabled(true);
    
        // Extract user ID and append @forgea.com
        const userId = formData.email.trim(); // Get entered ID
        const emailWithDomain = `${userId}@forgea.com`; // Append domain
    
        // Validate only the user ID (not full email)
        if (!userId) {
            setErrors({ email: 'User ID is required' });
            setDisabled(false);
            return;
        }
    
        if (!formData.password) {
            setErrors({ password: 'Password is required' });
            setDisabled(false);
            return;
        }
    
        const auth = getAuth();
        signInWithEmailAndPassword(auth, emailWithDomain, formData.password)
            .then(async () => {
                const q = query(collection(db, "Users"), where("email", "==", emailWithDomain));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    const dataMobile = {
                        id: userId,
                        percentD: 0,
                        percentI: 0,
                        percentS: 0,
                        percentW: 0,
                        personalitySummary: 'NONE',
                        type: 1,
                    };
                    await setDoc(doc(db, "Users", userId), dataMobile, { merge: true });
                }
                console.log('Login successful');
                setDisabled(false);
                navigate('/Disclaimer');
            })
            .catch((error) => {
                setDisabled(false);
                const errorCode = error.code;
                if (errorCode === 'auth/wrong-password') {
                    setFirebaseError('Incorrect password');
                } else if (errorCode === 'auth/user-not-found') {
                    setFirebaseError('No user found with this ID');
                } else if (errorCode === 'auth/invalid-credential') {
                    setErrors({ password: 'Invalid credentials, check user ID or password' });
                } else {
                    setFirebaseError('Login failed, please try again');
                }
            });
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className='LoginSignin'>
                <Grid2 container spacing={0} direction="row" className="MainGridContainer" columnGap={0}>
                    <Grid2>
                        <Paper elevation={24} className="paperContainerLeft">
                            <form onSubmit={handleSubmit}>
                                <div className="inputField">
                                    <Tooltip title="Example Student ID: 11-1111-111" arrow>
                                    <TextField
                                        color='primary'
                                        variant="filled"
                                        label="Student ID"
                                        Tooltip="Example Student ID: 11-1111-111"
                                        name="email"
                                        type="text"
                                        value={formData.email}
                                        onChange={handleChange}
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email}
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
                                {firebaseError && (
                                    <Typography color="error" className="firebaseError">
                                        {firebaseError}
                                    </Typography>
                                )}
                                <Button
                                    sx={{bgcolor:"#444444"}}
                                    type="submit"
                                    variant="contained"
                                    className="button"
                                    disabled={disabled}
                                >
                                    {!disabled &&
                                        (<>Sign In</>)
                                    }
                                    {disabled &&
                                        <CircularProgress color="inherit" size="30px"/>
                                    }
                                    
                                </Button>
                            </form>
                            
                        </Paper>
                    </Grid2>
                    <Grid2 className="GridSignup">
                        <Paper elevation={24} className="paperContainerRight" >
                        <Typography variant="h5" className="typographyHeader" color='white' marginTop={7}>
                            <strong>Welcome to Forgea</strong>
                        </Typography>
                        <Typography variant="h8" className="typographyHeader" color='white'>
                            Don't have an account?
                        </Typography>
                        <p/>
                        <div className='signIn' marginTop={10}>
                            <Button variant='outlined' color='dark.primary' onClick={() => navigate('/signup')} className="buttonSignup">
                                Sign Up
                            </Button>
                        </div></Paper>
                        
                    </Grid2>
                </Grid2>
            </div>
        </ThemeProvider>
    );
};

export default LoginSignin;