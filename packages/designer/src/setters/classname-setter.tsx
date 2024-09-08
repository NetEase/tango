import React, { useState } from 'react';

function ClassNameInput() {
  const [classNames, setClassNames] = useState<string[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const classes = input.split(' ').filter((className) => className.trim() !== '');
    setClassNames(classes);
  };

  return (
    <div>
      <input type="text" onChange={handleInputChange} placeholder="输入 class 名称" />
      <div>
        当前 class 列表:
        {classNames.map((className, index) => (
          <span key={index} className={className}>
            {className}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ClassNameInput;
