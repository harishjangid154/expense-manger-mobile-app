import React from 'react';
import { View, Text, Button, Pressable } from 'react-native';

export const ToastContext = React.createContext({
  showToast: (message: string) => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<{ id: string; message: string }[]>(
    [],
  );

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      onClearToast(id);
    }, 3000);
  };
  const onClearToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        {toasts.map(toast => (
          <View
            key={toast.id}
            style={{
              backgroundColor: 'black',
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white' }}>{toast.message}</Text>
            <Pressable
              onPress={() => onClearToast(toast.id)}
              style={{ position: 'absolute', right: 10, top: 10 }}
            >
              <Text style={{ color: 'white' }}>X</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};
