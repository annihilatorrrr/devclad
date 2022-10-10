import Airtable from 'airtable';
import { toast } from 'react-hot-toast';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
});

const base = Airtable.base(import.meta.env.VITE_AIRTABLE_BASE);

export default function handleForm(email: string) {
  base('Table 1').create(
    [
      {
        fields: { Email: email },
      },
    ],
    (err, records) => {
      if (err) {
        //   console.error(err);
        return;
      }
      if (records) {
        records.forEach((record) => {
          toast.success(`Thanks, you'll be notified of the launch!`, {
            style: {
              background: '#000',
              color: '#fff',
              border: '1px dashed #555',
              width: '100%',
              fontSize: '18px',
              textAlign: 'center',
            },
            duration: 5000,
            icon: '🚀',
            id: `${record.getId()}`,
          });
        });
      }
    }
  );
}
