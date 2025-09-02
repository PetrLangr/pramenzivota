import ReservationWizard from '@/components/ReservationWizard';

export default function Home() {
  return (
    <div>
      <ReservationWizard />
      
      {/* Admin Access Link */}
      <div className="text-center mt-8">
        <a 
          href="/admin"
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium underline"
        >
          🔧 Administrátorský přístup
        </a>
      </div>
    </div>
  );
}
