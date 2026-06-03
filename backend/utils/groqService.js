const axios = require('axios');

const getPriceSuggestion = async (category, condition, description) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `You are a pricing expert for a local marketplace in Jaipur, India.
Suggest a fair resale price in INR for this item:
- Category: ${category}
- Condition: ${condition}
- Description: ${description}

Reply with ONLY a single number (no currency symbol, no text, no explanation). Example: 5000`
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const price = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(price) ? null : Math.round(price);
  } catch (err) {
    console.error('Groq error:', err.message);
    return null;
  }
};

module.exports = { getPriceSuggestion };
