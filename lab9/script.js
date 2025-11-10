
document.getElementById('get-joke-btn').addEventListener('click', () => {
    fetch('https://v2.jokeapi.dev/joke/Any')
        .then(response => response.json())
        .then(data => {
            let jokeText = '';

            if (data.type === 'single') {
                jokeText = data.joke; 
            } else {
                jokeText = `${data.setup} - ${data.delivery}`; 
            }

           
            document.getElementById('joke').textContent = jokeText;
        })
        .catch(error => {
            console.error('Error fetching joke:', error);
            document.getElementById('joke').textContent = 'Oops! There was an error fetching the joke.';
        });
});
