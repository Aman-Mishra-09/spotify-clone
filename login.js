// Form switching
document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            mode: 'cors'
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Server error. Please try again.');
        console.error('Error:', error);
    }
});

// Signup form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    console.log('🚀 Sending signup request...'); // Debug
    
    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        console.log('📥 Response status:', response.status); // Debug
        
        const data = await response.json();
        console.log('📦 Response data:', data); // Debug
        
        if (response.ok) {
            alert('Signup successful! Please login.');
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        alert('Server error. Please try again.');
        console.error('❌ Error:', error);
    }
});