import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router) { }


  ngOnInit() {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      day: ['', [Validators.required]],
      month: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const day = +this.form.get('day').value;
    if (day < 1 || day > 31) {
      return;
    }

    const month = +this.form.get('month').value;
    if (month < 1 || month > 12) {
      return;
    }

    const ugly = this.form.get('name').value + '/' + day + '-' + month;

    this.router.navigate(['chat', ugly]);
  }
}
