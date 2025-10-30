import React, { useMemo, useState } from "react";
import "./Game.css";
import IntroPage from "./IntroPage";
import QuestionPage from "./QuestionPage";
import ResultPage from "./ResultPage";

// Question data
const QUESTIONS = [
  {
    id: 1,
    title: "The Entrance Hall",
    image: "/assets/game/entrance.jpg",
    storyText:
      "The air is thick with the scent of sugar, vanilla, and something magical. Standing before you are three grand, ornate doors, each leading to a different section of the patisserie.",
    questionText: "Question 1: Which door do you enter first?",
    options: [
      {
        value: "A",
        image: "/assets/game/conservatory.jpg",
        title: "The Crystal Conservatory",
        description:
          "You hear the gentle trickle of a fountain and see glistening, delicate pastries through the glass. It feels refined and elegant.",
      },
      {
        value: "B",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "The Cozy Hearth Kitchen",
        description:
          "A warm, comforting glow and the smell of baking bread and cinnamon spill from this doorway. It feels like a hug.",
      },
      {
        value: "C",
        image: "/assets/game/pastrychef.png",
        title: "The Alchemist's Laboratory",
        description:
          "Pops of color, bubbling beakers (of syrup?), and the sound of sizzling caramel greet you. It feels exciting and unpredictable.",
      },
    ],
  },
  {
    id: 2,
    title: "The First Challenge",
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=80",
    storyText:
      "You pass through your chosen door and find yourself in a large, kitchen-like chamber. A tiny, floating whisk with googly eyes zips up to you and presents you with your first test.",
    questionText:
      "Question 2: The floating whisk demands you choose one essential baking ingredient. Which do you grab?",
    options: [
      {
        value: "A",
        image: "/assets/game/vanillabean.jpg",
        title: "A Vanilla Bean",
        description:
          "Classic, aromatic, and the foundation of countless exquisite flavors.",
      },
      {
        value: "B",
        image: "/assets/game/butter.jpg",
        title: "Rich, Creamy Butter",
        description:
          "The heart of comfort baking, making everything richer and more satisfying.",
      },
      {
        value: "C",
        image: "/assets/game/ghostpepper.jpg",
        title: "A Ghost Pepper",
        description:
          "Wait, what? It's definitely not standard, but you're drawn to the challenge of creating something unforgettable and bold.",
      },
    ],
  },
  {
    id: 3,
    title: "A Magical Encounter",
    image: "/assets/game/pastry.jpg",
    storyText:
      "As you hand the ingredient to the whisk, a puff of flour erupts, and in its place stands the Head Pastry Mage, a kind-eyed woman with a hat shaped like a croissant.",
    questionText:
      'Question 3: She smiles and says, "To see your soul, I must see how you handle pressure. A cake is about to collapse! What\'s your first instinct?"',
    options: [
      {
        value: "A",
        image:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Analyze and Support",
        description:
          "Quickly find the structural weakness and strategically insert a skewer or support. Precision is key.",
      },
      {
        value: "B",
        image:
          "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Cover it in Love (and Frosting)",
        description:
          "Don't panic! A thick layer of delicious frosting and some beautiful berries can hide any flaw. It's about the overall feeling, not perfection.",
      },
      {
        value: "C",
        image:
          "https://images.unsplash.com/photo-1587314168485-3236d6710814?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Turn it into Something New",
        description:
          'Let it collapse! Now it\'s a deconstructed "trifle" or "cake pop" mixture. A problem is just a chance for innovation.',
      },
    ],
  },
  {
    id: 4,
    title: "The Final Choice",
    image:
      "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=80",
    storyText:
      'The Mage nods, impressed. "You have a strong spirit. But one final question remains." She leads you to a table with three magnificent, finished desserts.',
    questionText:
      'Question 4: "Which of these final masterpieces calls to you?"',
    options: [
      {
        value: "A",
        image: "/assets/game/mirrorglaze.jpg",
        title: "A Mirror Glaze Cake",
        description:
          "Impeccably smooth, shimmering with a deep, cosmic blue glaze, decorated with a single, delicate gold leaf. It's a work of art.",
      },
      {
        value: "B",
        image: "/assets/game/applecobbler.jpeg",
        title: "A Warm Apple Cobbler",
        description:
          "Served in a rustic ceramic dish with a crunchy, sugary top, steam rising to mingle with the melting vanilla bean ice cream on top.",
      },
      {
        value: "C",
        image: "/assets/game/lemon.jpeg",
        title: "A Deconstructed Lemon Meringue Pie",
        description:
          'A modern arrangement of sharp lemon curd, torched meringue peaks, and crumbled ginger snap "soil." It\'s playful and intriguing.',
      },
    ],
  },
];

// Personality results
const PERSONALITY_DATA = {
  A: {
    title: "The Sophisticated Crème Brûlée",
    description:
      "You are elegant, refined, and value tradition and quality. Like a perfect Crème Brûlée, you have a calm, composed exterior that hides a rich, deep, and wonderfully complex interior. People are drawn to your classic charm and unwavering reliability. You appreciate the finer things in life and have a keen eye for beauty and detail. Sometimes you can be a little reserved, but once someone breaks through your 'caramelized shell,' they find a wonderfully warm and loyal heart.",
    image: "/assets/game/cremebrulee.jpg",
    color: "#ffd9ec",
    songs: ["37i9dQZF1DX4UtSsGT1Sbe"],
    comments: [
      { author: "Chocolate Chip Cookie", text: "I love how you always know the perfect wine pairing!" },
      { author: "Spicy Chocolate Tart", text: "Your attention to detail is inspiring." },
      { author: "Fusion Cupcake", text: "You make elegance look effortless!" },
    ],
    talent:
      "Your hidden talent is curating the perfect ambiance - you can transform any space into something magical with just a few thoughtful touches.",
  },
  B: {
    title: "The Heartwarming Chocolate Chip Cookie",
    description:
      "You are the embodiment of comfort, warmth, and genuine kindness. Like the perfect Chocolate Chip Cookie, you are universally loved and make everyone around you feel at home. You are unpretentious, dependable, and find joy in life's simple pleasures. Your strength isn't in being flashy, but in being deeply, wholesomely satisfying. You are the friend everyone calls when they need a shoulder to lean on or a warm, comforting presence.",
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    color: "#ffd9ec",
    songs: ["37i9dQZF1DX4SBhb3fqCJd"],
    comments: [
      { author: "Crème Brûlée", text: "Your hugs are literally the best thing in the world." },
      { author: "Spicy Chocolate Tart", text: "You remember everyone's coffee order!" },
      { author: "Fusion Cupcake", text: "Your presence instantly makes any room feel cozier." },
    ],
    talent:
      "Your hidden talent is remembering small but meaningful details about people - you make everyone feel truly seen and valued.",
  },
  C: {
    title: "The Daring Spicy Chocolate Tart",
    description: "You are innovative, bold, and utterly unpredictable. Like a Spicy Chocolate Tart, you combine unexpected elements to create something thrilling and memorable. You have a fiery spirit and a zest for life that draws people to your energy. You're not afraid to break the rules and are always seeking the next adventure or creative project. You can be intense for some, but for those who can keep up, you are an exhilarating and unforgettable force of nature.",
    image: "/assets/game/choctart.jpeg",
    color: "#ffd9ec",
    songs: ["37i9dQZF1DX0XUsuxWHRQd"],
    comments: [
      { author: "Crème Brûlée", text: "I wish I had your confidence to speak my mind!"},
      { author: "Chocolate Chip Cookie", text: "Your energy is absolutely contagious!" },
      { author: "Fusion Cupcake", text: "You turn every ordinary moment into an adventure." },
    ],
    talent:
      "Your hidden talent is improvisation - you can turn any disaster into an opportunity and make brilliant decisions under pressure.",
  },
  mixed: {
   title: "The Experimental Fusion Cupcake",
    description: "You are a true original, a creative free spirit who can't be easily categorized. Like a Wasabi-Green Tea-Passionfruit Cupcake, you are a fascinating fusion of different ideas, energies, and tastes. You adapt to any situation, bringing a unique perspective and a touch of whimsy to everything you do. You get bored easily with routine and thrive on change and self-expression. Your personality is a delightful surprise that keeps people guessing and always coming back for more.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    color: "#ffd9ec",
    songs: [
        "37i9dQZF1DXcBWIGoYBM5M", // "Today's Top Hits" playlist
        "spotify:track:04KTF78FFg8sOHC1BADqbY" // "Blinding Lights" track
    ],
    comments: [
        {author: "Crème Brûlée", text: "You always have the most interesting stories to tell!"},
        {author: "Chocolate Chip Cookie", text: "Your creativity amazes me every single time."},
        {author: "Spicy Chocolate Tart", text: "You see possibilities where others see problems."}
    ],
    talent: "Your hidden talent is connecting seemingly unrelated ideas - you're a natural innovator who brings fresh perspectives to everything."
  },
};

export default function PersonalityQuiz() {
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const totalPages = 6;

  const progressPercent = useMemo(
    () => Math.min((pageIndex / (totalPages - 1)) * 100, 100),
    [pageIndex]
  );

  const handleStart = () => setPageIndex(1);

  const handleAnswer = (value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[pageIndex - 1] = value;
      return next;
    });
  };

  const goNext = () => {
    if (pageIndex < 4) setPageIndex((p) => p + 1);
    else if (pageIndex === 4) setPageIndex(5);
  };

  const selectedForCurrent =
    pageIndex >= 1 && pageIndex <= 4 ? answers[pageIndex - 1] : undefined;

  const resultType = useMemo(() => {
    if (answers.length < 4) return null;
    const counts = { A: 0, B: 0, C: 0 };
    answers.forEach((a) => {
      if (a && counts[a] !== undefined) counts[a] += 1;
    });
    if (counts.A >= counts.B && counts.A >= counts.C) return "A";
    if (counts.B >= counts.A && counts.B >= counts.C) return "B";
    if (counts.C >= counts.A && counts.C >= counts.B) return "C";
    return "mixed";
  }, [answers]);

  return (
    <div className="pq-container">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progressPercent}%` }} />
      </div>

      {pageIndex === 0 && (
        <IntroPage
          title="The Enchanted Patisserie"
          image="/assets/game/patisserie.jpg"
          storyText="Welcome, brave adventurer, to the doorstep of the legendary Enchanted Patisserie! It is said that the mystical pastry chefs within can craft a dessert that perfectly captures the essence of your soul. But first, you must prove your worth. The door creaks open, inviting you into a world of sweet wonders and hidden challenges. Your journey to discover your true dessert spirit begins now..."
          onStart={handleStart}
        />
      )}

      {pageIndex >= 1 && pageIndex <= 4 && (
        <QuestionPage
          title={QUESTIONS[pageIndex - 1].title}
          image={QUESTIONS[pageIndex - 1].image}
          storyText={QUESTIONS[pageIndex - 1].storyText}
          questionText={QUESTIONS[pageIndex - 1].questionText}
          options={QUESTIONS[pageIndex - 1].options}
          selected={selectedForCurrent}
          onSelect={handleAnswer}
          onNext={goNext}
          showNext={true} // ✅ bring back Continue button
        />
      )}

      {pageIndex === 5 && resultType && (
        <ResultPage result={PERSONALITY_DATA[resultType]} showRestart={false} />
      )}
    </div>
  );
}
