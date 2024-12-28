// // import { useEffect } from "react";
// // import { useAuthStore } from "~/store/authStore";

// // export const useAuth = () => {
// //   const {
// //     authenticated,
// //     role,
// //     apiUrl,
// //     setAuthState,
// //     initialize,
// //     login,
// //     logout,
// //     fetchUserData,
// //     setApiUrl,
// //     isLoading,
// //     isInitialized,
// //     token,
// //     userData,
// //   } = useAuthStore();

// //   useEffect(() => {
// //     // Only initialize if not already initialized
// //     if (!isInitialized) {
// //       initialize();
// //     }
// //   }, [isInitialized]);

// //   return {
// //     authState: {
// //       authenticated,
// //       role,
// //       apiUrl,
// //       token,
// //       userData,
// //       isInitialized,
// //     },
// //     setAuthState,
// //     login,
// //     logout,
// //     fetchUserData,
// //     setApiUrl,
// //     isLoading,
// //   };
// // };

// import { useEffect, useState } from "react";
// import { useAuthStore } from "~/store/authStore";

// export const useAuth = () => {
//   const {
//     authenticated,
//     role,
//     apiUrl,
//     initialize,
//     login,
//     logout,
//     fetchUserData,
//     setApiUrl,
//     isLoading,
//     token,
//     userData,
//   } = useAuthStore();

//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       await initialize();
//       setIsInitialized(true);
//     };
//     init();
//   }, [initialize]);

//   return {
//     authState: {
//       authenticated,
//       role,
//       apiUrl,
//       token,
//       userData,
//       isInitialized,
//     },
//     login,
//     logout,
//     fetchUserData,
//     setApiUrl,
//     isLoading,
//   };
// };
