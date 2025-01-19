interface CardData {
  type: 'Analysis' | 'ProjectCreation' | 'ChangeRequest' | 'TodoList' | 'Error';
  content: any;
  color: string;
}

interface CardDetailProps {
  card: CardData;
  onClose: () => void;
}

const getColorClass = (color: string) => {
  switch (color) {
    case '🟪 purple': return 'bg-purple-500 text-white';
    case '🟦 blue': return 'bg-blue-500 text-white';
    case '🟩 green': return 'bg-green-500 text-white';
    case '🟨 yellow': return 'bg-yellow-500 text-white';
    case '🟥 red': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export function CardDetail({ card, onClose }: CardDetailProps) {
  const handleAction = async () => {
    switch (card.type) {
      case 'ProjectCreation':
        // Trigger project creation workflow
        break;
      case 'ChangeRequest':
        // Open change request form
        break;
      // ... handle other card types
    }
  };

  return (
    <div className={`p-4 rounded-lg ${getColorClass(card.color)}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{card.type}</h3>
        <button onClick={onClose} className="text-white">×</button>
      </div>
      <pre className="whitespace-pre-wrap">{JSON.stringify(card.content, null, 2)}</pre>
      <button onClick={handleAction}>Take Action</button>
    </div>
  );
}