const AbstractBackground = () => {
  return (
    <div className="abstract-background">
      {/* Circles */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>

      {/* Geometric shapes */}
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
      <div className="shape shape-4"></div>

      {/* Lines */}
      <div className="lines lines-1"></div>
      <div className="lines lines-2"></div>

      {/* Dots */}
      <div className="dots dots-1"></div>
      <div className="dots dots-2"></div>

      <style jsx>{`
        .abstract-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .circle {
          position: absolute;
          border-radius: 50%;
        }
        
        .circle-1 {
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          top: -50px;
          left: -50px;
        }
        
        .circle-2 {
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.03);
          bottom: -100px;
          right: -100px;
        }
        
        .circle-3 {
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.07);
          bottom: 20%;
          left: 10%;
        }
        
        .shape {
          position: absolute;
        }
        
        .shape-1 {
          width: 80px;
          height: 80px;
          background: #FFD600;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          top: 40%;
          left: 20%;
        }
        
        .shape-2 {
          width: 60px;
          height: 60px;
          background: #00BCD4;
          top: 60%;
          left: 10%;
        }
        
        .shape-3 {
          width: 40px;
          height: 40px;
          background: #FF5722;
          border-radius: 50%;
          top: 20%;
          right: 30%;
        }
        
        .shape-4 {
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          bottom: 15%;
          right: 20%;
          transform: rotate(45deg);
        }
        
        .lines {
          position: absolute;
        }
        
        .lines-1 {
          width: 100%;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.1) 10px,
            transparent 10px,
            transparent 20px
          );
          top: 70%;
        }
        
        .lines-2 {
          width: 2px;
          height: 200px;
          background: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.1) 10px,
            transparent 10px,
            transparent 20px
          );
          top: 30%;
          right: 40%;
        }
        
        .dots {
          position: absolute;
        }
        
        .dots-1 {
          width: 150px;
          height: 150px;
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.2) 2px,
            transparent 2px
          );
          background-size: 15px 15px;
          top: 10%;
          right: 10%;
        }
        
        .dots-2 {
          width: 100px;
          height: 100px;
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.2) 2px,
            transparent 2px
          );
          background-size: 10px 10px;
          bottom: 10%;
          left: 30%;
        }
      `}</style>
    </div>
  )
}

export default AbstractBackground

