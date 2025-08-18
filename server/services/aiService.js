const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.model = 'gpt-4';
  }

  async generateFragranceDNA(userAnswers) {
    try {
      const prompt = `
        Based on the user's perfume preferences, convert their answers into a structured Fragrance DNA profile.
        
        User Answers:
        ${JSON.stringify(userAnswers, null, 2)}
        
        Please create a JSON object with the following structure:
        {
          "families": {
            "citrus": 0.0-1.0,
            "woody": 0.0-1.0,
            "floral": 0.0-1.0,
            "oriental": 0.0-1.0,
            "fresh": 0.0-1.0,
            "leather": 0.0-1.0,
            "chypre": 0.0-1.0,
            "gourmand": 0.0-1.0
          },
          "notes": {
            "bergamot": 0.0-1.0,
            "cedar": 0.0-1.0,
            "rose": 0.0-1.0,
            "vanilla": 0.0-1.0,
            "lavender": 0.0-1.0,
            "patchouli": 0.0-1.0,
            "jasmine": 0.0-1.0,
            "amber": 0.0-1.0,
            "sandalwood": 0.0-1.0,
            "musk": 0.0-1.0
          },
          "contexts": ["office", "evening", "summer", "winter", "date", "casual"],
          "performance": {
            "longevity": "light|moderate|strong|very_strong",
            "sillage": "discreet|moderate|projecting|very_projecting"
          }
        }
        
        Assign weights (0.0-1.0) based on the user's preferences. Higher values indicate stronger preference.
        Only include the JSON response, no additional text.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating fragrance DNA:', error);
      throw new Error('Failed to generate fragrance profile');
    }
  }

  async generateRecommendations(perfumes, userProfile, limit = 10) {
    try {
      const perfumeData = perfumes.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        family: p.family,
        notes: p.notes,
        longevity: p.longevity,
        sillage: p.sillage,
        gender: p.gender,
        description: p.description
      }));

      const prompt = `
        You are a perfume expert. Based on the user's fragrance profile and the available perfumes, recommend the best matches.
        
        User Profile:
        ${JSON.stringify(userProfile, null, 2)}
        
        Available Perfumes (${perfumes.length} total):
        ${JSON.stringify(perfumeData, null, 2)}
        
        Please analyze each perfume and return a JSON array of the top ${limit} recommendations with scores and explanations:
        [
          {
            "perfume_id": 123,
            "score": 0.85,
            "explanation": "This perfume perfectly matches your preference for citrus and woody notes. The bergamot top note aligns with your love for fresh, bright fragrances, while the cedar base provides the sophisticated woody depth you enjoy. It's perfect for office wear with moderate projection."
          }
        ]
        
        Scoring criteria:
        - Family match (30%): How well the perfume family aligns with user preferences
        - Notes match (40%): Overlap between perfume notes and user's preferred notes
        - Context suitability (15%): How well it fits user's intended usage contexts
        - Performance match (10%): Alignment with longevity/sillage preferences
        - Gender appropriateness (5%): Match with user's gender preference
        
        Only return the JSON array, no additional text.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async generatePerfumeExplanation(perfume, userProfile) {
    try {
      const prompt = `
        You are a perfume expert writing for a premium fragrance app. Create a compelling, concise explanation of why this perfume would suit the user.
        
        Perfume Details:
        ${JSON.stringify(perfume, null, 2)}
        
        User Profile:
        ${JSON.stringify(userProfile, null, 2)}
        
        Write a 2-3 sentence explanation that:
        1. Highlights the key notes that match the user's preferences
        2. Explains the fragrance character and when it's best worn
        3. Uses elegant, premium language suitable for a luxury fragrance app
        4. Avoids mentioning external websites or sources
        
        Keep it concise and engaging. Focus on the personal connection between the perfume and the user's taste.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating perfume explanation:', error);
      return 'This fragrance aligns with your preferences and would be a great addition to your collection.';
    }
  }

  async refineRecommendationsWithFeedback(recommendations, userFeedback) {
    try {
      const prompt = `
        Based on the user's feedback on previous recommendations, refine the scoring algorithm for future recommendations.
        
        Previous Recommendations:
        ${JSON.stringify(recommendations, null, 2)}
        
        User Feedback:
        ${JSON.stringify(userFeedback, null, 2)}
        
        Analyze the feedback and return a JSON object with adjusted weights for different factors:
        {
          "family_weight": 0.0-1.0,
          "notes_weight": 0.0-1.0,
          "context_weight": 0.0-1.0,
          "performance_weight": 0.0-1.0,
          "gender_weight": 0.0-1.0,
          "reasoning": "Brief explanation of weight adjustments based on feedback"
        }
        
        Adjust weights based on what the user liked/disliked. If they disliked woody fragrances, reduce family_weight. If they loved citrus notes, increase notes_weight.
        
        Only return the JSON object, no additional text.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error refining recommendations:', error);
      throw new Error('Failed to refine recommendations');
    }
  }

  async generatePerfumeSummary(perfume) {
    try {
      const prompt = `
        Create a premium, concise summary of this perfume for a luxury fragrance app.
        
        Perfume Details:
        ${JSON.stringify(perfume, null, 2)}
        
        Write a 1-2 sentence summary that:
        1. Captures the essence and character of the fragrance
        2. Uses elegant, sophisticated language
        3. Highlights the most distinctive notes or qualities
        4. Avoids mentioning external sources or websites
        5. Sounds like it belongs in a high-end perfume boutique
        
        Keep it concise and evocative.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 100,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating perfume summary:', error);
      return 'A sophisticated fragrance with distinctive character.';
    }
  }
}

module.exports = new AIService();
