import { QuizCard, QuizCategory } from "./QuizCard";

type QuizCardGridProps = {
  onSelectQuiz: (category: QuizCategory) => void;
};

export function QuizCardGrid({ onSelectQuiz }: QuizCardGridProps) {
  const categories: QuizCategory[] = ['math', 'aptitude', 'grammar', 'programming'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {categories.map((category) => (
        <QuizCard
          key={category}
          category={category}
          onPlay={() => onSelectQuiz(category)}
        />
      ))}
    </div>
  );
}
