interface TimeReturnProps {
  status: boolean;
  content?: string;
}

const Time = async ({
  timezone,
}: {
  timezone?: string;
}): Promise<TimeReturnProps> => {
  try {
    const tz = timezone || "UTC";

    // Validate timezone by attempting to create DateTimeFormat
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
    } catch (error) {
      return {
        status: false,
        content: `Invalid timezone: "${tz}". Please provide a valid IANA timezone identifier (e.g., "America/New_York", "Europe/London").`,
      };
    }

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const formattedTime = formatter.format(now);
    const [date, time] = formattedTime.split(", ");
    const timeInfo = `Current time in ${tz}: ${date} ${time}`;

    return {
      status: true,
      content: timeInfo,
    };
  } catch (error) {
    return {
      status: false,
      content:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the time.",
    };
  }
};

export default Time;
