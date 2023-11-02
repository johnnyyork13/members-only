const signupForm = document.getElementById('signupForm');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const signupBtn = document.getElementById('signupBtn');
const passwordMessage = document.getElementById('passwordMessage');

signupBtn.addEventListener('click', function(e) {
    if (password.value !== confirmPassword.value) {
        e.preventDefault();
        password.style.border = "2px solid red";
        confirmPassword.style.border = "2px solid red";
        passwordMessage.textContent = "Please enter matching passwords."
    }
})
