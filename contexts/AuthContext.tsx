// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut,
//   onAuthStateChanged,
//   sendEmailVerification,
//   updateProfile,
//   GoogleAuthProvider,
//   signInWithCredential,
//   User as FirebaseUser,
// } from 'firebase/auth';
// import { makeRedirectUri, useAuthRequest, AuthRequestPromptOptions } from 'expo-auth-session';
// import * as WebBrowser from 'expo-web-browser';
// import { auth } from '../firebaseConfig';
// import { User, AuthContextType } from '../types';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { setUser as setUserRedux, setLoading as setLoadingRedux, clearUser } from '../store/slices/authSlice';

// WebBrowser.maybeCompleteAuthSession();

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const dispatch = useAppDispatch();
//   const user = useAppSelector((state) => state.auth.user);
//   const loading = useAppSelector((state) => state.auth.loading);

//   // Get and validate client ID
//   const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  
//   // IMPORTANT: Use Expo's proxy with HTTPS for OAuth redirect
//   const redirectUri = makeRedirectUri({
//     useProxy: true,
//   });

//   // Log configuration for debugging
//   useEffect(() => {
//     console.log('🔧 Google OAuth Configuration:');
//     console.log('📱 Client ID:', clientId ? `${clientId.substring(0, 20)}...` : '❌ MISSING');
//     console.log('🔗 Redirect URI:', redirectUri);
//     console.log('⚠️ If redirect URI is exp://, restart with: npx expo start --clear');
    
//     if (!clientId || clientId === 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE') {
//       console.error('❌ CRITICAL: Google Web Client ID is not configured!');
//     }
//   }, []);

//   // Configure the Google OAuth request
//   const [request, response, promptAsync] = useAuthRequest(
//     {
//       clientId: clientId,
//       scopes: ['openid', 'profile', 'email'],
//       redirectUri: redirectUri,
//       responseType: 'id_token',
//     },
//     {
//       authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
//     }
//   );

//   // Handle OAuth response
//   useEffect(() => {
//     console.log('🔄 OAuth Response:', response?.type);
    
//     if (response?.type === 'success') {
//       console.log('✅ OAuth Success! Processing authentication...');
//       const { id_token, access_token } = response.params;
      
//       console.log('🎫 ID Token received:', id_token ? 'Yes' : 'No');
//       console.log('🔑 Access Token received:', access_token ? 'Yes' : 'No');
      
//       if (!id_token) {
//         console.error('❌ No ID token in response');
//         return;
//       }
      
//       // Sign in to Firebase with Google credential
//       console.log('🔐 Creating Firebase credential...');
//       const credential = GoogleAuthProvider.credential(id_token);
      
//       console.log('🚀 Signing in to Firebase...');
//       signInWithCredential(auth, credential)
//         .then((userCredential) => {
//           console.log('✅ Firebase sign-in successful!');
//           console.log('👤 User:', userCredential.user.email);
          
//           const userData: User = {
//             uid: userCredential.user.uid,
//             email: userCredential.user.email,
//             displayName: userCredential.user.displayName,
//             emailVerified: userCredential.user.emailVerified,
//           };
//           dispatch(setUserRedux(userData as any));
//           console.log('✅ User data saved to Redux');
//         })
//         .catch((error) => {
//           console.error('❌ Firebase sign-in error:', error.code);
//           console.error('❌ Error message:', error.message);
//         });
//     } else if (response?.type === 'error') {
//       console.error('❌ OAuth Error:', response.error);
//       console.error('❌ Error description:', response.params);
//     } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
//       console.log('ℹ️ User cancelled the sign-in');
//     }
//   }, [response]);

//   useEffect(() => {
//     try {
//       const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//         if (firebaseUser) {
//           const userData: User = {
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             displayName: firebaseUser.displayName,
//             emailVerified: firebaseUser.emailVerified,
//           };
//           dispatch(setUserRedux(userData as any));
//         } else {
//           dispatch(clearUser());
//         }
//       });

//       return unsubscribe;
//     } catch (error) {
//       console.error('Auth initialization error:', error);
//       dispatch(setLoadingRedux(false));
//     }
//   }, []);

//   const signUp = async (email: string, password: string, fullName: string) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
//       // Update profile with display name
//       await updateProfile(userCredential.user, {
//         displayName: fullName,
//       });

//       // Send verification email
//       await sendEmailVerification(userCredential.user);
      
//       // Reload user to get updated info
//       await userCredential.user.reload();
      
//       const userData: User = {
//         uid: userCredential.user.uid,
//         email: userCredential.user.email,
//         displayName: fullName,
//         emailVerified: userCredential.user.emailVerified,
//       };
//       dispatch(setUserRedux(userData as any));
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   };

//   const signIn = async (email: string, password: string) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const userData: User = {
//         uid: userCredential.user.uid,
//         email: userCredential.user.email,
//         displayName: userCredential.user.displayName,
//         emailVerified: userCredential.user.emailVerified,
//       };
//       dispatch(setUserRedux(userData as any));
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   };

//   const signOut = async () => {
//     try {
//       await firebaseSignOut(auth);
//       dispatch(clearUser());
//     } catch (error: any) {
//       throw new Error(error.message);
//     }
//   };

//   const sendVerificationEmail = async () => {
//     if (auth.currentUser) {
//       try {
//         await sendEmailVerification(auth.currentUser);
//       } catch (error: any) {
//         throw new Error(error.message);
//       }
//     }
//   };

//   const reloadUser = async () => {
//     if (auth.currentUser) {
//       await auth.currentUser.reload();
//       const userData: User = {
//         uid: auth.currentUser.uid,
//         email: auth.currentUser.email,
//         displayName: auth.currentUser.displayName,
//         emailVerified: auth.currentUser.emailVerified,
//       };
//       dispatch(setUserRedux(userData as any));
//     }
//   };

//   const signInWithGoogle = async () => {
//     console.log('🔵 Google Sign-In initiated...');
    
//     // Check if client ID is configured
//     const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
//     if (!clientId || clientId === 'YOUR_GOOGLE_WEB_CLIENT_ID_HERE') {
//       console.error('❌ Google Web Client ID not configured!');
//       throw new Error('Google Sign-In is not configured. Please add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env file');
//     }
    
//     // Check if request is ready
//     if (!request) {
//       console.error('❌ OAuth request not ready');
//       throw new Error('Authentication service is not ready. Please try again.');
//     }
    
//     console.log('✅ Configuration valid, opening browser...');
    
//     try {
//       const result = await promptAsync();
//       console.log('🔄 Prompt result:', result.type);
      
//       if (result.type !== 'success') {
//         if (result.type === 'cancel' || result.type === 'dismiss') {
//           throw new Error('Sign-in was cancelled');
//         }
//         throw new Error(`Sign-in failed: ${result.type}`);
//       }
      
//       console.log('✅ User completed authentication flow');
//     } catch (error: any) {
//       console.error('❌ Google Sign-In prompt error:', error.message);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         signUp,
//         signIn,
//         signOut,
//         sendVerificationEmail,
//         reloadUser,
//         signInWithGoogle,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }



import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../firebaseConfig';
import { User, AuthContextType } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser as setUserRedux, setLoading as setLoadingRedux, clearUser } from '../store/slices/authSlice';

// IMPORTANT: Complete auth session
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Client IDs from Google Cloud Console
const WEB_CLIENT_ID = '66106372266-nlci3m6avt7o0a7reqlpt12t9b9vdt41.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '66106372266-hkfq1nkoj52akhj7qs19ch9d7053die0.apps.googleusercontent.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  // Log configuration
  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔧 GOOGLE OAUTH - EAS BUILD');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📱 Android Client ID:', ANDROID_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('🌐 Web Client ID:', WEB_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('═══════════════════════════════════════════════════════');
  }, []);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  // Handle OAuth response
  useEffect(() => {
    console.log('🔄 OAuth Response:', response?.type);

    if (response?.type === 'success') {
      console.log('✅ OAuth Success!');
      
      const { authentication } = response;
      
      if (authentication?.idToken) {
        console.log('🎫 ID Token received');
        const credential = GoogleAuthProvider.credential(
          authentication.idToken,
          authentication.accessToken
        );
        signInToFirebase(credential);
      } else if (authentication?.accessToken) {
        console.log('🔑 Access Token received (no ID token)');
        const credential = GoogleAuthProvider.credential(null, authentication.accessToken);
        signInToFirebase(credential);
      } else {
        console.error('❌ No tokens received');
      }
    } else if (response?.type === 'error') {
      console.error('❌ OAuth Error:', response.error);
    }
  }, [response]);

  // Firebase sign in helper
  const signInToFirebase = async (credential: any) => {
    try {
      console.log('🚀 Signing in to Firebase...');
      const userCredential = await signInWithCredential(auth, credential);
      
      console.log('✅ Firebase sign-in successful!');
      console.log('👤 Email:', userCredential.user.email);
      
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    } catch (error: any) {
      console.error('❌ Firebase error:', error.code, error.message);
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('🔌 Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔄 Auth state:', firebaseUser ? 'Logged in' : 'No user');
      
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
        };
        dispatch(setUserRedux(userData as any));
      } else {
        dispatch(clearUser());
      }
      dispatch(setLoadingRedux(false));
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      await sendEmailVerification(userCredential.user);
      await userCredential.user.reload();
      
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: fullName,
        emailVerified: userCredential.user.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      dispatch(clearUser());
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const userData: User = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        emailVerified: auth.currentUser.emailVerified,
      };
      dispatch(setUserRedux(userData as any));
    }
  };

  const signInWithGoogle = async () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔵 GOOGLE SIGN-IN');
    console.log('═══════════════════════════════════════════════════════');

    if (!request) {
      throw new Error('Google Sign-In is not ready. Please try again.');
    }

    try {
      const result = await promptAsync();
      console.log('📋 Result:', result.type);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Sign-in was cancelled');
      }
      
      if (result.type !== 'success') {
        throw new Error(`Sign-in failed: ${result.type}`);
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        sendVerificationEmail,
        reloadUser,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}