// CAPTCHA System (copied)
let captchaAnswer = '';
let loginCaptchaAnswer = '';

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    let question;
    let captchaData;
    
    switch(operation) {
        case '+':
            answer = num1 + num2;
            question = `${num1} + ${num2}`;
            captchaData = `${num1} + ${num2} = ${answer}`;
            break;
        case '-':
            const maxNum = Math.max(num1, num2);
            const minNum = Math.min(num1, num2);
            answer = maxNum - minNum;
            question = `${maxNum} - ${minNum}`;
            captchaData = `${maxNum} - ${minNum} = ${answer}`;
            break;
        case '*':
            answer = num1 * num2;
            question = `${num1} × ${num2}`;
            captchaData = `${num1} * ${num2} = ${answer}`;
            break;
    }
    
    captchaAnswer = btoa(captchaData);
    
    const challengeEl = document.getElementById('captcha-challenge');
    if (challengeEl) challengeEl.textContent = `what is ${question}?`;
    const inputEl = document.getElementById('captcha-input');
    if (inputEl) inputEl.value = '';
}

document.addEventListener('DOMContentLoaded', generateCaptcha);
