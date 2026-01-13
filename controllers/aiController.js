import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateBlogAssistance = async (req, res) => {
  try {
    const { type, input } = req.body;
    
    if (!type || !input) {
      return res.status(400).json({ message: 'Type and input are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = '';
    
    switch (type) {
      case 'improve':
        prompt = `Improve and enhance the following blog content while maintaining the original message and tone. Make it more engaging, clear, and well-structured:\n\n${input}`;
        break;
        
      case 'generate-title':
        prompt = `Generate 5 engaging and SEO-friendly blog post titles based on this content:\n\n${input}\n\nProvide only the titles, one per line.`;
        break;
        
      case 'generate-excerpt':
        prompt = `Create a compelling 2-3 sentence excerpt/summary for the following blog post content:\n\n${input}`;
        break;
        
      case 'suggest-tags':
        prompt = `Suggest 5-8 relevant tags/keywords for the following blog post content:\n\n${input}\n\nProvide only the tags, comma-separated.`;
        break;
        
      case 'expand':
        prompt = `Expand the following blog content with more details, examples, and insights while maintaining the same writing style:\n\n${input}`;
        break;
        
      case 'continue':
        prompt = `Continue writing the following blog post in the same style and tone:\n\n${input}`;
        break;

      case 'simplify':
        prompt = `Simplify the following blog content to make it easier to understand while keeping the key points:\n\n${input}`;
        break;

      default:
        return res.status(400).json({ message: 'Invalid assistance type' });
    }

    console.log('🤖 Generating AI assistance for type:', type);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ AI response generated successfully');

    res.status(200).json({
      success: true,
      result: text,
      type
    });

  } catch (error) {
    console.error('❌ AI assistance error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate AI assistance'
    });
  }
};

export const generateBlogIdeas = async (req, res) => {
  try {
    const { category, keywords } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = 'Generate 10 unique and engaging blog post ideas';
    
    if (category) {
      prompt += ` for the category: ${category}`;
    }
    
    if (keywords) {
      prompt += ` related to: ${keywords}`;
    }
    
    prompt += '. For each idea, provide a title and a brief description (2-3 sentences). Format as: Title: [title]\nDescription: [description]\n';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      ideas: text
    });

  } catch (error) {
    console.error('❌ Blog ideas generation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate blog ideas'
    });
  }
};
