const conatiner = document.querySelector(".conatiner");
const loginswitch = document.querySelector(".loginswitch")
const signupswitch = document.querySelector(".signupswitch")
const nameinput = document.querySelector(".nameinput");
const nameswitch = document.querySelector(".nameswitch");
let checkbox = document.querySelector("#checkbox");
const submitbtn = document.querySelector(".submit-btn")
let username = document.querySelector(".username");
let email = document.querySelector(".emailid")
let password = document.querySelector(".password");
const admintext = document.querySelector(".admintext");
const form = document.querySelector("#form");

conatiner.style.display = "none";
loginswitch.addEventListener("click", showcontainer);
signupswitch.addEventListener("click", showcontainer);


function showcontainer(event) {
    conatiner.style.display = "block";
    console.log(event.target.innerHTML);
    if (event.target.innerHTML == "login") {
        nameinput.style.display = "none";
        nameswitch.innerHTML = "login";
        checkbox.style.display = "none";
        admintext.style.display = "none";
        submitbtn.innerHTML = "Login";
           

    } else {
        console.log(nameswitch);
        nameinput.style.display = "flex";
        nameswitch.innerHTML = "Signup";
        checkbox.style.display = "block";
        admintext.style.display = "block";
        submitbtn.innerHTML = "Signup";
   
    }
}
submitbtn.addEventListener("click", (event) => {
      event.preventDefault(); 
    if (submitbtn.innerHTML == "Signup") {
        signupfun();
    } else {
         form.submit();
        loginfun();
    }
})

function isValidEmail(email) {
    // Sirf @gmail.com par khatam hone wala email allow kare
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

function isValidPassword(password) {
    // Kam se kam 8 digit ka number hona chahiye
    return /^\d{8,}$/.test(password);
}

async function signupfun() {
    if (username.value == "" || password.value == "" || email.value == "") {
        alert("first field your");
    }
    else if (!isValidEmail(email.value)) {
        alert("Please enter a valid Gmail address (example@gmail.com)");
    }
    else if (!isValidPassword(password.value)) {
        alert("Password must be at least 8 digits (numbers only)");
    }
    else try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value,
                checkbox: checkbox.checked
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("Signup successful!");
            form.reset();
        } else {
            alert(result.message);
        }
       
    } catch (err) {
        console.error("Signup error:", err);
        alert("Signup failed. Check your connection or server.");
    }

}
function loginfun() {

    if (password.value == "" || email.value == "") {
        alert("Please fill all fields");
        return;
    }

    if (!isValidEmail(email.value)) {
        alert("Please enter a valid Gmail address (example@gmail.com)");
        return;
    }

    if (!isValidPassword(password.value)) {
        alert("Password must be at least 8 digits (numbers only)");
        return;
    }
   
}
