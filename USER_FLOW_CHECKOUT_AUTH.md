# User Flow Documentation: Storefront Checkout with Authentication

## Overview
This document describes the enhanced checkout process that now requires user account creation and authentication before completing a purchase.

## Pre-Authentication State

### Before Login (Guest Users)
1. **Navigation Bar**:
   - Account button shows "Sign In"
   - No account details visible
   - Cart icon visible with item count

2. **Product Pages & Shopping**:
   - Users can browse products, add to cart
   - Items visible in cart dropdown
   - No account required for browsing/products

3. **Checkout Process**:
   - "Proceed to Checkout" button visible in cart
   - Automatic redirect to authentication modal
   - Modals: AuthModal component (Sign In / Create Account)

## Authentication Modal

### On First Visit (New User)
1. **Modal Opens**: "Welcome Back" (Login mode)
2. **Login Options**:
   - Email/Phone + Password
   - Google Sign In button (when available)
3. **Inputs Required**:
   - Phone Number (minimum 10 characters)
   - Password (6+ characters for signup)
   - Name (for new accounts)

### Forms
**Login Mode**:
- Phone Number field
- Password field
- "Sign up" link to switch to Create Account

**Create Account Mode**:
- Name field
- Phone Number field  
- Password field (6+ characters)
- "Sign in" link to switch to Login

### Actions
1. **Input Validation**:
   - Phone must be 10+ characters
   - Password minimum requirements met
   - Name required for new accounts

2. **Authentication Attempts**:
   - On submit → authenticate against backend
   - Success → close modal, populate checkout
   - Failure → show error, allow retry

3. **Google Login** (if enabled):
   - Separate button for social auth
   - Redirects to Google OAuth
   - Returns to storefront with authenticated state

## Post-Authentication Flow

### After Successful Login
1. **Check Out Modal Behavior**:
   - **Account link** now shows in navigation
   - **Sign In button** replaced with Account button
   - Displays user name and account status

2. **Authentication Validation**:
   - PLACE_ORDER_FUNCTION calls → verify token
   - Return to Auth Modal if unauthorized
   - Continue with checkout if authenticated

3. **Data Preservation**:
   - Checkout form pre-populates with account details
   - User info saved for future purchases
   - Account saves in localStorage for persistence

### Account Page Access
1. **Navigation**:
   - Account link → /b/{brandSlug}/account
   - View order history
   - Account settings

2. **Order History**:
   - Displays all past orders
   - Order details accessible
   - Reorder functionality

### Returning User Experience
1. **One-Click Checkout**:
   - Account details auto-filled
   - Reduced form completion time
   - Saved payment preferences (if implemented)

2. **Account Status Indicators**:
   - Visual account verification
   - Order tracking accessible
   - Account management options

## Error Handling

### Authentication Failures
1. **Invalid Credentials**:
   - Clear error messages
   - Form repopulation
   - Retry option available

2. **Token Issues**:
   - Automatic logout detection
   - Re-authentication prompt
   - Session management

### Checkout Failures
1. **Order Placement Issues**:
   - Payment processing errors
   - Inventory availability
   - Network connectivity
   - Clear error messaging with retry options

2. **Account Issues**:
   - Account locked/suspended
   - Verification required
   - Support contact options

## Mobile Experience

### Touch Optimization
1. **Responsive Design**:
   - Larger tap targets
   - Simplified form layouts
   - Mobile-friendly authentication

2. **Mobile Specifics**:
   - Swipe gestures
   - Keyboard optimization
   - Finger-friendly button sizes

### Mobile Account Access
1. **Bottom Navigation**:
   - Account icon in bottom nav
   - Quick access to account
   - Streamlined mobile experience

## Loyalty & Retention

### Account Benefits
1. **Order History**:
   - View past purchases
   - Reorder frequently bought items
   - Track order status

2. **Saved Information**:
   - Addresses auto-filled
   - Payment methods saved (future enhancement)
   - Account preferences

## Technical Considerations

### Security
1. **Authentication Flow**:
   - JWT tokens securely stored
   - Token validation on checkout
   - Account verification

2. **Data Protection**:
   - Encrypted sensitive information
   - Secure session management
   - Account access controls

### Performance
1. **Form Optimization**:
   - Auto-fill minimizes input time
   - Caching of account data
   - Reduced server calls

2. **User Experience**:
   - Seamless transitions
   - Loading state management
   - Error prevention

## Implementation Summary

### User Benefits
1. **Security**:
   - Account protection
   - Order tracking
   - Payment security

2. **Convenience**:
   - Faster checkout
   - Data persistence
   - Order history access

3. **Trust**:
   - Professional account management
   - Order confirmation
   - Reliable support

### Business Benefits
1. **Data Collection**:
   - Customer information
   - Purchase history
   - Marketing opportunities

2. **Customer Service**:
   - Order tracking
   - Support access
   - Account management

### Technical Implementation
1. **Frontend**:
   - Authentication state management
   - Modal integration
   - API error handling
   - Responsive design

2. **Backend**:
   - Existing API utilization
   - JWT token validation
   - Customer account management
   - Order creation

## Migration Path

### From Guest to Account
1. **Early Stage**:
   - Account creation encouraged at checkout
   - Benefits highlighted
   - Seamless transition

2. **Long-term**:
   - Account becomes standard
   - Guest checkout optional (future enhancement)
   - Premium account features (future enhancement)

## Testing Considerations

### User Journey Testing
1. **Authentication Flow**:
   - Login success/failure scenarios
   - Social authentication
   - Token validation

2. **Checkout Testing**:
   - Authenticated checkout flow
   - Error recovery
   - Mobile experience

3. **Account Access**:
   - Account page functionality
   - Order history access
   - Profile management

This user flow ensures a secure, convenient, and professional checkout experience while maintaining data security and user trust.