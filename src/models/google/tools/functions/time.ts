function get_current_time({ timezone }: { timezone: string | undefined }): string {
  const date = new Date();

  try {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);
    const dateParts: { [key: string]: string } = {};

    parts.forEach(({ type, value }) => {
      dateParts[type] = value;
    });

    return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
  } catch (error) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

export default get_current_time;
