case "create-test":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Create Test</h1>
            <Card>
              <CardHeader>
                <CardTitle>New Test / Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Course</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>Data Structures & Algorithms</option>
                      <option>Database Management Systems</option>
                      <option>Computer Networks</option>
                    </select>
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" placeholder="60" />
                  </div>
                </div>

                <div>
                  <Label>Test Title</Label>
                  <Input placeholder="Enter test title" />
                </div>

                <div>
                  <Label>Instructions</Label>
                  <Textarea placeholder="Test instructions for students" />
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  <Label className="text-lg font-semibold">Questions</Label>
                  {questions.map((q, index) => (
                    <div key={index} className="border p-4 rounded-lg bg-muted/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Question {index + 1}</h3>
                        {questions.length > 1 && (
                          <Button variant="destructive" size="sm" onClick={() => removeQuestion(index)}>
                            Remove
                          </Button>
                        )}
                      </div>

                      <Input
                        placeholder={`Enter question ${index + 1}`}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((label, optIndex) => (
                          <Input
                            key={optIndex}
                            placeholder={`Option ${label}`}
                            value={q.options[optIndex]}
                            onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                          />
                        ))}
                      </div>

                      <div>
                        <Label>Correct Answer</Label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={q.correct}
                          onChange={(e) => handleCorrectChange(index, e.target.value)}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />Add Question
                  </Button>
                </div>

                <Button className="btn-success">
                  <TestTube className="h-4 w-4 mr-2" />Create Test
                </Button>
              </CardContent>
            </Card>
          </div>
        );




        const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct: "A" },
  ]);

  // ✅ Handlers for create-test
  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: "A" }]);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (index, value) => {
    const updated = [...questions];
    updated[index].correct = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };




  case "attendance":
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<Record<string, string>>({
    "1": "Present",
    "2": "Absent",
    "3": "Present",
  });

  const students = [
    { id: "1", name: "Ravi Kumar", roll: "21CSE001" },
    { id: "2", name: "Priya Sharma", roll: "21CSE002" },
    { id: "3", name: "Arjun Reddy", roll: "21CSE003" },
  ];

  const handleAttendanceChange = (id: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = () => {
    console.log("Attendance saved for:", selectedDate, attendance);
    alert(`Attendance saved for ${selectedDate}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-2 border-b">Roll No</th>
              <th className="px-4 py-2 border-b">Student Name</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-muted/40">
                <td className="px-4 py-2 border-b">{student.roll}</td>
                <td className="px-4 py-2 border-b">{student.name}</td>
                <td className="px-4 py-2 border-b">
                  <select
                    value={attendance[student.id] || "Absent"}
                    onChange={(e) =>
                      handleAttendanceChange(student.id, e.target.value)
                    }
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={handleSaveAttendance} className="btn-primary">
        Save Attendance
      </Button>
    </div>
  );














  case "discussions":
  

  case "resources":
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Course Resources</h1>
        {!showUploadForm ? (
          <Button
            className="btn-primary"
            onClick={() => setShowUploadForm(true)}
          >
            Upload Resource
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowUploadForm(false)}
          >
            ← Back to Resources
          </Button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm ? (
        <div className="max-w-xl border rounded-lg p-6 bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upload New Resource</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter resource title (e.g. DSA Lecture Notes)"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select File</label>
              <input
                type="file"
                accept=".pdf,.mp4,.docx,.pptx,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <Button
              className="btn-primary w-full"
              onClick={handleUploadSubmit}
            >
              Upload Resource
            </Button>
          </div>
        </div>
      ) : (
        /* Resource List View */
        <div>
          {resources.length === 0 ? (
            <p className="text-muted-foreground text-center mt-10">
              No resources uploaded yet. Click "Upload Resource" to add new files.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg truncate">
                      {res.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {res.type.toUpperCase()} • {res.date}
                    </p>
                  </div>

                  <div className="mt-3">
                    {res.type === "video" ? (
                      <video
                        src={res.url}
                        controls
                        className="rounded-md w-full mt-2"
                      />
                    ) : (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View / Download Resource
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );


 

  case "timetable":
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Class Timetable</h1>
        {!showUploadTimetable ? (
          <Button className="btn-primary" onClick={() => setShowUploadTimetable(true)}>
            Upload Timetable
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowUploadTimetable(false)}>
            ← Back to Timetables
          </Button>
        )}
      </div>

      {/* Upload Timetable Form */}
      {showUploadTimetable ? (
        <div className="max-w-lg border rounded-lg p-6 bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upload New Timetable (PDF)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={timetableTitle}
                onChange={(e) => setTimetableTitle(e.target.value)}
                placeholder="e.g. CSE 1st Year - Semester 1 Timetable"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select PDF File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setTimetableFile(e.target.files?.[0] || null)}
                className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <Button className="btn-primary w-full" onClick={handleTimetableUpload}>
              Upload Timetable
            </Button>
          </div>
        </div>
      ) : (
        /* Timetable List */
        <div>
          {timetables.length === 0 ? (
            <p className="text-muted-foreground text-center mt-10">
              No timetables uploaded yet. Click "Upload Timetable" to add one.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {timetables.map((tt) => (
                <div
                  key={tt.id}
                  className="border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg truncate">{tt.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{tt.date}</p>
                  </div>

                  <div className="mt-3">
                    <a
                      href={tt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View / Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
