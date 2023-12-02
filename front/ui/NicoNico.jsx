import React, { useState, useEffect } from 'react';
import './NicoNico.css'; // CSSファイルをインポート

export default function NicoNico({ comment }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (comment) {
      setShow(true);
      setTimeout(() => {
        setShow(false);
      }, 1900);
    }
  }, [comment]);

  if (!show) return null;

  return (
    <div className="comment-flow">
      {comment}
    </div>
  );
};

