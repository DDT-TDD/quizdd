use quizdd::models::{Answer};

fn main() {
    // Test simple string matching
    let correct = Answer::Text("6".to_string());
    let submitted = Answer::Text("6".to_string());
    
    match (&correct, &submitted) {
        (Answer::Text(c), Answer::Text(s)) => {
            let c_norm = c.trim().to_lowercase();
            let s_norm = s.trim().to_lowercase();
            println!("Correct: '{}' (normalized: '{}')", c, c_norm);
            println!("Submitted: '{}' (normalized: '{}')", s, s_norm);
            println!("Match: {}", c_norm == s_norm);
        },
        _ => println!("Type mismatch"),
    }
    
    // Test with whitespace
    let correct2 = Answer::Text("10".to_string());
    let submitted2 = Answer::Text(" 10 ".to_string());
    
    match (&correct2, &submitted2) {
        (Answer::Text(c), Answer::Text(s)) => {
            let c_norm = c.trim().to_lowercase();
            let s_norm = s.trim().to_lowercase();
            println!("\nCorrect: '{}' (normalized: '{}')", c, c_norm);
            println!("Submitted: '{}' (normalized: '{}')", s, s_norm);
            println!("Match: {}", c_norm == s_norm);
        },
        _ => println!("Type mismatch"),
    }
}
