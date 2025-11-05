import { useState } from 'react';
import { Calendar, MapPin, Clock, Map, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import profileImage from '@/assets/profile.png';
import Confetti from 'react-confetti';

const InvitationCard = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiRecycle, setConfettiRecycle] = useState(true);

  const handleCelebrate = () => {
    setShowConfetti(true);
    setConfettiRecycle(true);
    setTimeout(() => {
      setConfettiRecycle(false);
    }, 5000);
    setTimeout(() => {
      setShowConfetti(false);
    }, 8000);
  };

  const handleMapsClick = () => {
    // Placeholder - user will add address later
    window.open('https://maps.google.com', '_blank');
  };

  const handleNearbyClick = () => {
    // Placeholder - user will add location later
    window.open('https://maps.google.com/maps/search/mercado+conveniencia', '_blank');
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={confettiRecycle}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 text-center space-y-8">
            {/* Profile Image */}
            <div className="opacity-0 animate-fade-in">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse" />
                <img
                  src={profileImage}
                  alt="Wesley Maik"
                  className="relative w-full h-full rounded-full object-cover border-4 border-primary shadow-[0_0_30px_rgba(244,208,63,0.3)] hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4 opacity-0 animate-fade-in-delay-1">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent animate-float">
                Wesley Maik
              </h1>
              <div className="flex items-center justify-center gap-3 text-xl md:text-2xl text-muted-foreground">
                <Calendar className="w-6 h-6 text-primary" />
                <span>23 Anos</span>
              </div>
            </div>

            {/* Divider */}
            <div className="opacity-0 animate-fade-in-delay-2">
              <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Event Details */}
            <div className="space-y-4 opacity-0 animate-fade-in-delay-2">
              <div className="flex items-center justify-center gap-3 text-foreground/90">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-lg">Horário: [A definir]</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-foreground/90">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg">Local: [Endereço a ser adicionado]</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 opacity-0 animate-fade-in-delay-3">
              <Button
                onClick={handleMapsClick}
                variant="outline"
                className="w-full group border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Map className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Ver no Maps
              </Button>
              
              <Button
                onClick={handleNearbyClick}
                variant="outline"
                className="w-full group border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Store className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Lugares Próximos
              </Button>
            </div>

            {/* Celebrate Button */}
            <div className="pt-4 opacity-0 animate-fade-in-delay-4">
              <Button
                onClick={handleCelebrate}
                className="w-full md:w-auto px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-amber-400 to-primary bg-size-200 hover:bg-pos-100 transition-all duration-500 shadow-[0_0_30px_rgba(244,208,63,0.4)] hover:shadow-[0_0_50px_rgba(244,208,63,0.6)] hover:scale-105"
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                🎉 Festeje Comigo 🎉
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default InvitationCard;
