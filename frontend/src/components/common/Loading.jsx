import { Loader2 } from 'lucide-react';

const Loading = ({ text = 'Cargando...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="text-slate-500 font-medium">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
};

export default Loading;
