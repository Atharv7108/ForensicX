from fpdf import FPDF
import textwrap

# Human-written text (approximately 500 words)
human_text = """
The art of writing has always been a cornerstone of human expression. Throughout history, people have used various forms of writing to communicate ideas, preserve knowledge, and share stories. From ancient cave paintings to modern digital texts, the evolution of writing reflects our growing need to connect with others and document our experiences.

Writing is not just about putting words on paper; it's about crafting thoughts into coherent narratives that can inspire, educate, or entertain. Good writing requires careful consideration of structure, style, and audience. It demands clarity of thought and precision in language. When done well, writing can transport readers to different worlds, challenge their perspectives, and even change their lives.

One of the most important aspects of writing is authenticity. Readers can often tell when an author is being genuine versus when they're trying to impress or manipulate. Authentic writing comes from personal experience and honest reflection. It speaks to universal truths while remaining uniquely personal.

The process of writing itself is often challenging. It requires discipline, creativity, and persistence. Many writers struggle with writer's block, self-doubt, and the pressure to produce meaningful content. Yet, the satisfaction of completing a piece that resonates with readers makes all the effort worthwhile.

In today's digital age, writing has become more accessible than ever. Anyone with a computer or smartphone can publish their thoughts online. However, this accessibility also means that writers must work harder to stand out in a crowded marketplace of ideas. Quality and originality have become even more important in an era of information overload.

Despite these challenges, writing remains a powerful tool for personal growth and social change. Through writing, individuals can process their emotions, explore complex ideas, and contribute to larger conversations. Writing helps us make sense of our world and our place in it.

The relationship between writer and reader is fundamentally collaborative. While the writer creates the initial text, the reader brings their own experiences and interpretations to the reading experience. This interaction creates meaning that goes beyond the words on the page.

Writing also serves important social functions. It preserves cultural knowledge, documents historical events, and facilitates scientific discovery. Without writing, our ability to build upon previous knowledge would be severely limited.

As technology continues to evolve, so too does the practice of writing. New tools and platforms are constantly emerging, offering writers new ways to express themselves and reach audiences. However, the core principles of good writing remain unchanged: clarity, authenticity, and purpose.

Ultimately, writing is about connection. It's about bridging the gap between individual minds and creating shared understanding. In a world that often feels divided, writing has the power to bring people together through the exchange of ideas and experiences.
"""

# AI-generated text (approximately 500 words)
ai_text = """
The landscape of artificial intelligence continues to evolve at an unprecedented pace, transforming industries and reshaping our understanding of what machines can achieve. As we stand on the brink of this technological revolution, it's crucial to examine both the opportunities and challenges that lie ahead.

Machine learning algorithms have become increasingly sophisticated, capable of performing complex tasks that were once thought to be exclusively human domains. From natural language processing to computer vision, AI systems are demonstrating remarkable capabilities that are pushing the boundaries of what's possible.

One of the most significant developments in recent years has been the advancement of large language models. These systems, trained on vast amounts of text data, can generate coherent and contextually appropriate responses to a wide range of queries. They can write articles, create poetry, translate languages, and even engage in meaningful conversations.

The applications of AI are becoming increasingly diverse. In healthcare, AI systems are assisting doctors in diagnosing diseases and developing treatment plans. In finance, they're helping to detect fraudulent transactions and optimize investment strategies. In transportation, they're enabling autonomous vehicles and improving traffic management systems.

However, as AI becomes more powerful, it also raises important ethical and societal questions. Concerns about job displacement, privacy, and algorithmic bias have become central to discussions about the future of AI. It's essential that we develop frameworks for responsible AI development and deployment.

The concept of artificial general intelligence, or AGI, represents the next frontier in AI research. While current systems excel at specific tasks, AGI would possess the ability to understand and learn any intellectual task that a human can. Achieving AGI remains a distant goal, but progress toward this objective is accelerating.

The integration of AI with other emerging technologies, such as blockchain and quantum computing, promises to unlock even greater potential. These synergies could lead to breakthroughs in fields ranging from drug discovery to climate modeling.

Education and workforce development will play crucial roles in preparing society for an AI-driven future. As certain jobs become automated, new opportunities will emerge in AI-related fields. Reskilling and lifelong learning will become essential for individuals and organizations alike.

The governance of AI presents complex challenges. International cooperation will be necessary to establish standards for AI safety, transparency, and accountability. Balancing innovation with responsible development will require careful consideration of diverse perspectives and interests.

As we look to the future, it's clear that AI will continue to shape our world in profound ways. The choices we make today about how we develop and deploy AI will determine whether this technology serves to enhance human potential or create new forms of inequality and division.

The journey ahead will require wisdom, collaboration, and a commitment to human values. By approaching AI development with both ambition and caution, we can harness its power to create a more prosperous and equitable future for all.
"""

def create_mixed_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Add title
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 15, "Mixed Content Analysis Test Document", ln=True, align='C')
    pdf.ln(10)

    # Add human-written section
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Human-Written Content", ln=True)
    pdf.set_font("Arial", size=12)

    # Split human text into paragraphs and add to PDF
    human_paragraphs = human_text.strip().split('\n\n')
    for paragraph in human_paragraphs:
        if paragraph.strip():
            # Wrap text to fit page width
            wrapped_lines = textwrap.wrap(paragraph.strip(), width=80)
            for line in wrapped_lines:
                pdf.cell(0, 6, line, ln=True)
            pdf.ln(3)

    pdf.ln(10)

    # Add AI-generated section
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "AI-Generated Content", ln=True)
    pdf.set_font("Arial", size=12)

    # Split AI text into paragraphs and add to PDF
    ai_paragraphs = ai_text.strip().split('\n\n')
    for paragraph in ai_paragraphs:
        if paragraph.strip():
            # Wrap text to fit page width
            wrapped_lines = textwrap.wrap(paragraph.strip(), width=80)
            for line in wrapped_lines:
                pdf.cell(0, 6, line, ln=True)
            pdf.ln(3)

    # Save the PDF
    output_path = "mixed_content_test.pdf"
    pdf.output(output_path)

    # Count words
    total_words = len(human_text.split()) + len(ai_text.split())
    print(f"PDF created: {output_path}")
    print(f"Total words: {total_words}")
    print(f"Human-written words: {len(human_text.split())}")
    print(f"AI-generated words: {len(ai_text.split())}")

if __name__ == "__main__":
    create_mixed_pdf()
